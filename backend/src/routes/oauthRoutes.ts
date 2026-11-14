import express from 'express'
import * as zod from 'zod'
import { randomBytes, randomInt, createHash } from 'node:crypto'
import { userRepository, authRepository, SESSION_COOKIE } from '../data/repositories'
import { Prisma } from '../../generated/client'
import { writeFile } from 'node:fs/promises'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

const CLIENT_ID = process.env.DISCORD_CLIENT_ID
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI

export const UPLOADS_DIR = path.resolve("uploads")
mkdirSync(path.join(UPLOADS_DIR, "avatars"), { recursive: true })

async function copyDiscordAvatar(discordId: string, avatarHash: string): Promise<string> {
	// Discord's CDN converts and resizes for us: a 256px WebP, whatever the original was.
	const url = `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.webp?size=256`
	const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
	if (!res.ok) throw new Error(`avatar download failed: ${res.status}`)
	if (res.headers.get("content-type") !== "image/webp") throw new Error("avatar is not webp")

	const bytes = Buffer.from(await res.arrayBuffer())
	if (bytes.length > 1_000_000) throw new Error("avatar too large")   // a 256px webp is ~10–50 KB

	const key = `avatars/${randomBytes(16).toString("base64url")}.webp`
	await writeFile(path.join(UPLOADS_DIR, key), bytes, { flag: "wx" })  // wx: never overwrite an existing file
	return key
}

const discordUserSchema = zod.object({
	username: zod.string(),
	id: zod.string().regex(/^\d+$/),
	avatar: zod.string().regex(/^(a_)?[0-9a-f]{32}$/).nullable(),   // "a_" = animated; .webp returns the first frame
})

function baseUsername(discordName: string): string {
	let name = discordName.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 15)
	if (name.length < 3) name = name.padEnd(3, "_")
	return name
}

function withSuffix(base: string): string {
	const suffix = "_" + randomInt(1000, 10000)   // from node:crypto, like randomBytes
	return base.slice(0, 15 - suffix.length) + suffix
}

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI)
	throw new Error("DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET and DISCORD_REDIRECT_URI must be set")

const OAUTH_COOKIE = "__Host-oauth"
const oauthCookieOptions = {
	httpOnly: true,   // JS can't read it
	secure: true,     // required by the __Host- prefix
	sameSite: "lax",  // not strict: the callback is a navigation coming from discord.com
	path: "/",        // required by the __Host- prefix
} as const
// Absolute path: the browser resolves it against the site, so this lands on the React login page.
const FAILURE_REDIRECT = "/login?error=oauth"

const router = express.Router()

router.get('/discord', (req, res) => {
	const state = randomBytes(32).toString("base64url")
	const codeVerifier = randomBytes(32).toString("base64url")  // 43 chars, the minimum PKCE allows
	const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url")

	res.cookie(OAUTH_COOKIE, `${state}.${codeVerifier}`, { ...oauthCookieOptions, maxAge: 10 * 60 * 1000 })


	const url = new URL("https://discord.com/oauth2/authorize")
	url.search = new URLSearchParams({
		response_type: "code",
		client_id: CLIENT_ID,
		redirect_uri: REDIRECT_URI,
		scope: "identify",            // id, username, avatar: nothing more is needed
		state,
		code_challenge: codeChallenge,
		code_challenge_method: "S256",
	}).toString()

	res.redirect(url.toString())
})


router.get('/discord/callback', async (req, res) => {
	const cookie = req.cookies[OAUTH_COOKIE]
	res.clearCookie(OAUTH_COOKIE, oauthCookieOptions)

	// Discord sends ?error=access_denied when the user clicks Cancel.
	// The typeof checks also reject repeated params (?code=a&code=b), which Express parses as arrays.
	const { code, state, error } = req.query
	if (error || typeof code !== "string" || typeof state !== "string" || typeof cookie !== "string")
		return res.redirect(FAILURE_REDIRECT)

	const [expectedState, codeVerifier] = cookie.split(".")
	if (!expectedState || !codeVerifier || state !== expectedState)
		return res.redirect(FAILURE_REDIRECT)

	try {
		const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",   // NOT JSON: Discord rejects JSON here
				Authorization: "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
			},
			body: new URLSearchParams({
				grant_type: "authorization_code",
				code,
				redirect_uri: REDIRECT_URI,   // must be identical to the one sent in step 1
				code_verifier: codeVerifier,  // Discord hashes it and compares with the step 1 challenge
			}),
			signal: AbortSignal.timeout(5000),
		})
		if (!tokenRes.ok) {
			console.error(await tokenRes.text())
			return res.redirect(FAILURE_REDIRECT)
		}
		const { access_token } = zod.object({ access_token: zod.string() }).parse(await tokenRes.json())
		const meRes = await fetch("https://discord.com/api/v10/users/@me", {
			headers: { Authorization: `Bearer ${access_token}` },
			signal: AbortSignal.timeout(5000),
		})
		if (!meRes.ok) {
			console.error("discord /users/@me failed", meRes.status)
			return res.redirect(FAILURE_REDIRECT)
		}
		const profile = discordUserSchema.parse(await meRes.json())
		let user = await userRepository.findByOAuthAccount('discord', profile.id);
		let isNew = false;
		if (!user) {
			const base = baseUsername(profile.username)
			for (let attempt = 0; attempt < 5 && !user; attempt++) {
				const username = attempt === 0 ? base : withSuffix(base)
				try {
					user = await userRepository.createWithOAuthAccount(username, "discord", profile.id)
				} catch (err) {
					if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")) throw err
					// P2002 = unique constraint violated: the username is taken, try another one
				}
			}
			if (!user) throw new Error("could not find a free username")
			isNew = true;
		}
		const previous = req.cookies[SESSION_COOKIE]
		if (previous) await authRepository.revokeSessionByToken(previous)
		if (isNew && profile.avatar) {
			try {
				const avatarKey = await copyDiscordAvatar(profile.id, profile.avatar)
				await userRepository.updateById(user.id, { avatarKey })
			} catch (err) {
				console.error("could not copy discord avatar", err)   // the user just gets the default avatar
			}
		}
		await authRepository.createSession(req, res, user.id)
		return res.redirect("/")
	}
	catch (err) {
		console.error("discord oath failed", err)
		return res.redirect(FAILURE_REDIRECT)
	}
})

export default router
import sharp from "sharp"
import { mkdirSync } from "node:fs"
import { writeFile, unlink } from "node:fs/promises"
import { randomBytes } from "node:crypto"
import path from "node:path"

export const UPLOADS_DIR = path.resolve("uploads")
mkdirSync(path.join(UPLOADS_DIR, "avatars"), { recursive: true })

const ACCEPTED_FORMATS = new Set(["jpeg", "png", "webp"])

export class InvalidImageError extends Error {}

/**
 * @description Turns untrusted bytes into a clean 256x256 WebP. Throws InvalidImageError for anything else.
 * @returns the normalized avatar
 */
export async function normalizeAvatar(input: Buffer): Promise<Buffer> {
  // limitInputPixels: refuse "decompression bombs" (a tiny file declaring a 50000x50000 image).
  const image = sharp(input, { limitInputPixels: 4096 * 4096 })
  const { format } = await image.metadata().catch(() => { throw new InvalidImageError("not an image") })
  //Only accept the usual formats. SVG especially, since it can embed scripts.
  if (!format || !ACCEPTED_FORMATS.has(format)) throw new InvalidImageError(`unsupported format: ${format}`)

  return image
    .rotate()                                  // apply the EXIF orientation, or phone photos come out sideways
    .resize(256, 256, { fit: "cover" })        // crop to a square, centered
    .webp({ quality: 80 })                     // re-encoding drops all metadata (EXIF, GPS...) and anything hidden in the file
    .toBuffer()
}

export async function saveAvatar(webp: Buffer): Promise<string> {
  const key = `avatars/${randomBytes(16).toString("base64url")}.webp`
  await writeFile(path.join(UPLOADS_DIR, key), webp, { flag: "wx" })
  return key
}

export async function deleteAvatar(key: string): Promise<void> {
  await unlink(path.join(UPLOADS_DIR, key)).catch((err) => {
    if (err.code !== "ENOENT") console.error("could not delete avatar", key, err)
  })
}

export async function copyDiscordAvatar(discordId: string, avatarHash: string): Promise<string> {
	/* Asking for a 256 * 256 webp from discords CDN is optionnal since NormalizeAvatar already
    Converts what's returned, but better safe than sorry
  */ 
	const url = `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.webp?size=256`
	const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
	if (!res.ok) throw new Error(`avatar download failed: ${res.status}`)
	if (res.headers.get("content-type") !== "image/webp") throw new Error("avatar is not webp")

	const bytes = Buffer.from(await res.arrayBuffer())
	if (bytes.length > 1_000_000) throw new Error("avatar too large")   // a 256px webp is ~10–50 KB

	return saveAvatar(await normalizeAvatar(bytes))
}

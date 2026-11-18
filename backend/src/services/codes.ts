import { createHmac, randomInt, timingSafeEqual } from "node:crypto"

const key = process.env['CODE_HMAC_KEY']
if (!key)
    throw new Error("No HMAC Encryption key")
const KEY: string = key

export const CODE_TTL_MS = 5 * 60 * 1000// minutes
export const MAX_ATTEMPTS = 5
export const RESEND_COOLDOWN_MS = 60 * 1000

export function generateCode() {
    return randomInt(0, 1_000_000).toString().padStart(6, "0")
}

export function hashCode(code: string) {
    return (createHmac("sha256", KEY).update(code).digest('hex'))
}

export function codeMatches(code: string, storedHash: string): boolean {
  const a = Buffer.from(hashCode(code), "hex")
  const b = Buffer.from(storedHash, "hex")
  return a.length === b.length && timingSafeEqual(a, b)
}
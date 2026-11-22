import { authRepository, otpVerificationRepository, userRepository } from "../data/repositories/index.ts"
import { PURGE_DELAY } from "./codes.ts";

const CLEANUP_INTERVAL = 5 * 60 * 1000
async function runCleanup() {
    try {
        const now = new Date();
        const then = new Date(now.getTime() - PURGE_DELAY)
        const purgedSessions = await authRepository.purgeExpiredSessions()
        const purgedUsers = await userRepository.purgeUnverified(then)
        const purgedCodes = await otpVerificationRepository.purgeExpired()
        console.log(`Purged ${purgedSessions.count} sessions, ${purgedUsers.count} users, ${purgedCodes.count} codes`)
    } catch (err) {
        console.error(err)
    }
}

export function startCleanupJob() {
    runCleanup()
    setInterval(runCleanup, CLEANUP_INTERVAL)
}
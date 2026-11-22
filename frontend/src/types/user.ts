export type User = {
    id: string
    username: string
    email: string | null
    emailVerifiedAt: string | null
    twoFactorEnabledAt: string | null
    createdAt: Date
    privateProfile: boolean
    avatarKey: string | null
}
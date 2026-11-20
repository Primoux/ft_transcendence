export type Role = "USER" | "MODERATOR" | "ADMIN" | "OWNER"

export type User = {
    id: string
    username: string
    createdAt: Date
    privateProfile: boolean
    avatarKey: string | null
    role?: Role
}

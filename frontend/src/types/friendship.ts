import type { User } from "./user"

export type FriendshipState =
    | { status: "none" }
    | { status: "pending-sent" | "pending-received" | "friends", friendshipId: string }

export type FriendRequest = {
    friendshipId: string
    sender: User
    sentAt: string
}

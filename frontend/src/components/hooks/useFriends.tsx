import { useEffect, useState } from "react"
import type { User } from "../../types/user"
import type { Friend } from "../friends/FriendList"

/** Shape of one entry of GET /api/users/me/friends (FriendSummary on the backend). */
type FriendSummaryResponse = {
    friendshipId: string
    friend: User
    connectedAt: string
}

type FriendsLoading = { status: "loading" }
type FriendsError = { status: "error" }
type FriendsLoaded = { status: "loaded", friends: Friend[] }

export function useFriends(): FriendsLoading | FriendsError | FriendsLoaded {
    const [state, setState] = useState<FriendsLoading | FriendsError | FriendsLoaded>({ status: "loading" })

    useEffect(() => {
        const abortController = new AbortController()
        async function fetchFriends() {
            try {
                const response = await fetch("/api/users/me/friends", { signal: abortController.signal })
                if (!response.ok) {
                    setState({ status: "error" })
                    return
                }
                const summaries: FriendSummaryResponse[] = await response.json()
                setState({
                    status: "loaded",
                    friends: summaries.map(({ friend }) => ({
                        id: friend.id,
                        username: friend.username,
                        avatarKey: friend.avatarKey,
                        // No presence websocket yet: everyone shows as offline.
                        presence: "offline",
                    })),
                })
            }
            catch (error) {
                if (!abortController.signal.aborted) {
                    console.error(error)
                    setState({ status: "error" })
                }
            }
        }

        fetchFriends()
        return (() => abortController.abort("stale content"))
    }, [])

    return state
}

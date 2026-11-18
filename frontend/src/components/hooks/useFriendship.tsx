import { useEffect, useState } from "react"
import type { FriendshipState } from "../../types/friendship"

type FriendshipLoading = { status: "loading" }
type FriendshipError = { status: "error" }
type FriendshipLoaded = { status: "loaded", friendship: FriendshipState }

type StoredFriendship = {
    username: string
    result: FriendshipError | FriendshipLoaded
}

async function fetchFriendship(username: string, signal?: AbortSignal): Promise<FriendshipState> {
    const response = await fetch(`/api/users/${encodeURIComponent(username)}/friendship`, { signal })
    if (!response.ok) {
        throw new Error(`GET friendship failed with ${response.status}`)
    }
    return response.json()
}

export function useFriendship(username: string) {
    const [stored, setStored] = useState<StoredFriendship | null>(null)
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        const abortController = new AbortController()
        fetchFriendship(username, abortController.signal)
            .then((friendship) => setStored({ username, result: { status: "loaded", friendship } }))
            .catch((error) => {
                if (!abortController.signal.aborted) {
                    console.error(error)
                    setStored({ username, result: { status: "error" } })
                }
            })
        return (() => abortController.abort("stale content"))
    }, [username])

    async function send(path: string, method: "POST" | "DELETE") {
        setBusy(true)
        let result: FriendshipError | FriendshipLoaded
        try {
            const response = await fetch(path, { method })
            let friendship: FriendshipState
            if (response.status === 204) {
                friendship = { status: "none" }
            }
            else if (response.ok) {
                friendship = await response.json()
            }
            else {
                friendship = await fetchFriendship(username)
            }
            result = { status: "loaded", friendship }
        }
        catch (error) {
            console.error(error)
            result = { status: "error" }
        }
        setStored((previous) => (previous?.username === username ? { username, result } : previous))
        setBusy(false)
    }

    const state: FriendshipLoading | FriendshipError | FriendshipLoaded =
        stored === null || stored.username !== username ? { status: "loading" } : stored.result

    return {
        state,
        busy,
        sendRequest: () => send(`/api/users/${encodeURIComponent(username)}/friend-request`, "POST"),
        accept: (friendshipId: string) => send(`/api/users/me/friend-requests/${encodeURIComponent(friendshipId)}/accept`, "POST"),
        remove: (friendshipId: string) => send(`/api/users/me/friendships/${encodeURIComponent(friendshipId)}`, "DELETE"),
    }
}

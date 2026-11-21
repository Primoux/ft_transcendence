import { useEffect, useState } from "react"
import type { FriendRequest } from "../../types/friendship"

type RequestsLoading = { status: "loading" }
type RequestsError = { status: "error" }
type RequestsLoaded = { status: "loaded", requests: FriendRequest[] }

export function useFriendRequests() {
    const [state, setState] = useState<RequestsLoading | RequestsError | RequestsLoaded>({ status: "loading" })
    const [reloadKey, setReloadKey] = useState(0)
    const [busyId, setBusyId] = useState<string | null>(null)

    useEffect(() => {
        const abortController = new AbortController()
        async function fetchRequests() {
            try {
                const response = await fetch("/api/users/me/friend-requests", { signal: abortController.signal })
                if (!response.ok) {
                    setState({ status: "error" })
                    return
                }
                const requests: FriendRequest[] = await response.json()
                setState({ status: "loaded", requests })
            }
            catch (error) {
                if (!abortController.signal.aborted) {
                    console.error(error)
                    setState({ status: "error" })
                }
            }
        }

        fetchRequests()
        return (() => abortController.abort("stale content"))
    }, [reloadKey])

    async function respond(friendshipId: string, action: "accept" | "decline"): Promise<boolean> {
        setBusyId(friendshipId)
        const id = encodeURIComponent(friendshipId)
        try {
            const response = action === "accept"
                ? await fetch(`/api/users/me/friend-requests/${id}/accept`, { method: "POST" })
                : await fetch(`/api/users/me/friendships/${id}`, { method: "DELETE" })
            if (!response.ok) {
                setReloadKey((key) => key + 1)
                return false
            }
            setState((previous) => previous.status !== "loaded" ? previous : {
                status: "loaded",
                requests: previous.requests.filter((request) => request.friendshipId !== friendshipId),
            })
            return true
        }
        catch (error) {
            console.error(error)
            return false
        }
        finally {
            setBusyId(null)
        }
    }

    return { state, busyId, respond }
}

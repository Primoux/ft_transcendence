import { useFriendship } from "../hooks/useFriendship"

function FriendshipActions({ username }: { username: string }) {
    const { state, busy, sendRequest, accept, remove } = useFriendship(username)

    if (state.status === "loading") {
        return (<span className="loading loading-spinner loading-sm self-start"></span>)
    }
    if (state.status === "error") {
        return (<p className="text-error text-sm">Could not load your friendship with this user.</p>)
    }

    const friendship = state.friendship
    switch (friendship.status) {
        case "none":
            return (
                <button type="button" className="btn btn-primary btn-sm self-start" disabled={busy} onClick={sendRequest}>
                    Add friend
                </button>
            )
        case "pending-sent":
            return (
                <button type="button" className="btn btn-sm self-start" disabled={busy} onClick={() => remove(friendship.friendshipId)}>
                    Cancel request
                </button>
            )
        case "pending-received":
            return (
                <div className="flex gap-2 self-start">
                    <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => accept(friendship.friendshipId)}>
                        Accept request
                    </button>
                    <button type="button" className="btn btn-sm" disabled={busy} onClick={() => remove(friendship.friendshipId)}>
                        Decline
                    </button>
                </div>
            )
        case "friends":
            return (
                <div className="flex gap-2 items-center self-start">
                    <span className="badge badge-success badge-outline">Friends</span>
                    <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => remove(friendship.friendshipId)}>
                        Remove friend
                    </button>
                </div>
            )
    }
}

export default FriendshipActions

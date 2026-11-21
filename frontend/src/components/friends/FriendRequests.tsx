import { Link } from "react-router"
import { Avatar } from "../Avatar"
import { useFriendRequests } from "../hooks/useFriendRequests"

function FriendRequests({ onAccepted }: { onAccepted: () => void }) {
    const { state, busyId, respond } = useFriendRequests()

    if (state.status === "loading" || (state.status === "loaded" && state.requests.length === 0)) {
        return null
    }
    if (state.status === "error") {
        return (<p>Error while loading your friend requests.</p>)
    }

    return (
        <div className="card bg-base-100 border border-base-300 w-full max-w-sm">
            <div className="card-body">
                <h2 className="card-title font-beleren-sc">Friend requests</h2>
                <ul className="list">
                    {state.requests.map((request) => (
                        <li key={request.friendshipId} className="list-row items-center">
                            <Avatar user={request.sender} className="h-8 w-8" />
                            <Link to={`/users/${encodeURIComponent(request.sender.username)}`} className="link link-hover list-col-grow">
                                {request.sender.username}
                            </Link>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className="btn btn-primary btn-xs"
                                    disabled={busyId === request.friendshipId}
                                    onClick={async () => {
                                        if (await respond(request.friendshipId, "accept")) {
                                            onAccepted()
                                        }
                                    }}
                                >
                                    Accept
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-xs"
                                    disabled={busyId === request.friendshipId}
                                    onClick={() => respond(request.friendshipId, "decline")}
                                >
                                    Decline
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default FriendRequests

import { useState } from "react"

export type FriendshipStatus = "none" | "pending" | "friends"

type AddFriendButtonProps = {
    status: FriendshipStatus
    /** Sends the friend request. Until the route exists, the click only switches the button to "Request sent" locally. */
    onAdd?: () => void
}

function AddFriendButton({ status, onAdd }: AddFriendButtonProps) {
    const [requested, setRequested] = useState(false)

    if (status === "friends") {
        return (<span className="badge badge-success badge-outline self-start">Friends</span>)
    }
    if (status === "pending" || requested) {
        return (
            <button type="button" className="btn btn-sm self-start" disabled>
                Request sent
            </button>
        )
    }
    return (
        <button
            type="button"
            className="btn btn-primary btn-sm self-start"
            onClick={() => {
                onAdd?.()
                setRequested(true)
            }}
        >
            Add friend
        </button>
    )
}

export default AddFriendButton

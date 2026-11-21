import { Link } from "react-router"
import { Avatar } from "../Avatar"

export type Friend = {
    id: string
    username: string
    avatarKey: string | null
    presence: "online" | "offline"
}

function FriendList({ friends }: { friends: Friend[] }) {
    return (
        <div className="card bg-base-100 border border-base-300 w-full max-w-sm">
            <div className="card-body">
                <h2 className="card-title font-beleren-sc">Friends</h2>
                {friends.length === 0 ? (
                    <p className="text-base-content/60">No friends yet.</p>
                ) : (
                    <ul className="list">
                        {friends.map((friend) => (
                            <li key={friend.id} className="list-row items-center">
                                <Avatar user={friend} className="h-8 w-8" presence={friend.presence} />
                                <Link to={`/users/${encodeURIComponent(friend.username)}`} className="link link-hover">
                                    {friend.username}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default FriendList

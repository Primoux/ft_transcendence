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
                <ul className="list">
                    {friends.map((friend) => (
                        <li key={friend.id} className="list-row items-center">
                            <Avatar user={friend} className="h-8 w-8" presence={friend.presence} />
                            <span>{friend.username}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default FriendList

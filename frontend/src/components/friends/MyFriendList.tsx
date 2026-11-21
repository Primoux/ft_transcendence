import FriendList from "./FriendList"
import FriendRequests from "./FriendRequests"
import Spinner from "../Spinner"
import { useFriends } from "../hooks/useFriends"

/** Friend list of the logged-in user, fed by GET /api/users/me/friends. */
function MyFriendList() {
    const { state: friends, reload } = useFriends()

    return (
        <div className="flex flex-col gap-4 w-full max-w-sm">
            <FriendRequests onAccepted={reload} />
            {friends.status === "loading" ? <Spinner />
                : friends.status === "error" ? <p>Error while loading your friends.</p>
                : <FriendList friends={friends.friends} />}
        </div>
    )
}

export default MyFriendList

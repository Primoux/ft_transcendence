import FriendList from "./FriendList"
import Spinner from "../Spinner"
import { useFriends } from "../hooks/useFriends"

/** Friend list of the logged-in user, fed by GET /api/users/me/friends. */
function MyFriendList() {
    const friends = useFriends()

    if (friends.status === "loading") {
        return (<Spinner />)
    }
    if (friends.status === "error") {
        return (<p>Error while loading your friends.</p>)
    }
    return (<FriendList friends={friends.friends} />)
}

export default MyFriendList

import { useUserStats } from "./hooks/useUser"
import Spinner from "./Spinner"

type userStatProps = { username: string }

function UserStats({username} : userStatProps) {
    const stats = useUserStats(username)

    
    if (stats.status === "private")
        return ( <h2>This user has made their stats private.</h2> )
    if (stats.status === "loading")
        return ( <Spinner /> )
    if (stats.status === "error")
        return (<h2> Error while fetching user's stats</h2>)

    return (
        <>
            <h2>Game stats</h2>
            <ul>
                <li>games won: {stats.wonSessionsCount} </li>
                <li>Average # of guesses : {stats.avgGuessCount === null ? "no games won yet" : stats.avgGuessCount} </li>
            </ul>
        </>
    )
}

export default UserStats
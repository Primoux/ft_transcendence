import { useState, useEffect} from "react"
import { useNavigate } from 'react-router'
import type {User} from './types/user'

type userStatProps = {
    currentUser: User
    username: string
    privateProfile: boolean 
}

function UserStats({currentUser, username, privateProfile} : userStatProps) {
    const [wonSessionsCount, setWonSessions] = useState<number>(0)
    const [avgGuessCount, setAvgGuessCount] = useState<number | null>(null)
    const [isLoading, setLoading] = useState<Boolean>(true)
    const goTo = useNavigate()
    useEffect( () => {
    async function fetchUserStats() {
        try {
            const response = await fetch(`/api/users/${username}/stats`)
            if (!response.ok) {
                console.log('server response was not OK')
            } else {
                const {wonSessions, avgGuess} = await response.json()
                setWonSessions(wonSessions)
                setAvgGuessCount(avgGuess)
            }
        } catch (error) {
            console.error(error)
            goTo("/")
        }
        finally {
            setLoading(false)
        }
    }
    setLoading(true)
    fetchUserStats()
}, [])

if (privateProfile && currentUser.username != username) {
    return (
        <h2>This user has made their stats private.</h2>
    )
}
return (
    <ul>
        <li>games won: {(isLoading && "loading" )|| wonSessionsCount}</li>
        <li>Average # of guesses : {(isLoading && "loading" ) || avgGuessCount || "No games won yet"}</li>
    </ul>
)
}

export default UserStats
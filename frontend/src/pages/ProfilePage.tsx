import { useNavigate, useParams } from 'react-router'
import type {User} from '../types/user'
import { useState, useEffect} from "react"

function ProfilePage() {
    const [userToView, setUserToView] = useState<User | null>(null)
    const params = useParams();
    const goTo = useNavigate();

    useEffect ( () => {
        async function fetchData(username: string) {
            try {
                const response = await fetch(`/api/users/${username}`)
                if (!response.ok) {
                    console.log('server response was not OK')
                    goTo("/");
                } else {
                    const userConst = await response.json();
                    setUserToView(userConst)
                }
            } catch (error) {
                console.error(error)
                goTo("/");
            }
        }
        if (params.username)
            fetchData(params.username)
        else {console.log("incorrect parameter")}
    }, [])
    if (userToView === null) {
        return (
                <section className="flex flex-col justify-center items-center rounded-md border-2 bg-white shadow-2xl h-2/3 w-2/3">
                    <div>
                    	<h2>No such user : {params.username}</h2>
                    </div>
                </section>

        )
    } else {
        const registerDate = new Date(userToView.registerDate)
        const dateStr = registerDate.toLocaleDateString('fr-FR', {timeZone: 'Europe/Paris'})
        return (
                <section className="flex flex-col justify-center items-center rounded-md border-2 bg-white shadow-2xl h-2/3 w-2/3">
                    <div>
                    <h2>{userToView.displayName}</h2>
                    <h2>{`@${userToView.username}`}</h2>
                    </div>
                    <ul>
                        {/* <li> member since : `${userToView.registerDate.getUTCDay.toString()} / ${userToView.registerDate.getUTCMonth.toString()} / ${userToView.registerDate.getUTCFullYear.toString()}` </li> */}
                        <li> member since : {`${dateStr}`}</li>
                        <li>games won: 0</li>
                    </ul>
                </section>
        )
    }
}

export default ProfilePage

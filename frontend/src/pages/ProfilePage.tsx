import { useNavigate, useParams } from 'react-router'
import type {User} from '../types/user'
import { useState, useEffect} from "react"
import UserStats from '../components/UserStats.tsx'
import { Link } from 'react-router'

type profilePageProps = {
    currentUser: User
}

function ProfilePage({currentUser}: profilePageProps) {
    const [userToView, setUserToView] = useState<User | null>(null)
    const [isLoading, setLoading] = useState<Boolean>(true)
    const params = useParams();
    const goTo = useNavigate();

    useEffect ( () => {
        async function fetchUser(username: string) {
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
            finally {
                setLoading(false)
            }
        }

        if (params.username)
            fetchUser(params.username)
        else {console.log("incorrect parameter")}
    }, [])

    if(isLoading)
    {
        return (
                <section className="flex flex-col justify-center items-center rounded-md border-2 bg-white shadow-2xl h-2/3 w-2/3">
                    <div>
                    <h2>loading</h2>
                    </div>
                </section>
        )
    }

    if (userToView === null) {
        return (
                <section className="flex flex-col justify-center items-center rounded-md border-2 bg-white shadow-2xl h-2/3 w-2/3">
                    <div>
                    	<h2>No such user : {params.username}</h2>
                    </div>
                </section>

        )
    } else {
        const registerDate = new Date(userToView.createdAt)
        console.log(`${userToView.username}`)
        console.log(`date: ${registerDate} from ${userToView.createdAt}`)
        const dateStr = registerDate.toLocaleDateString('fr-FR', {timeZone: 'Europe/Paris'})
        const currentUserEditProfileLink = `/users/${currentUser.username}/editProfile`
        const editProfileElement = <Link to={currentUserEditProfileLink}> Edit profile </Link>;
        return (
                <section className="flex flex-col justify-center items-center rounded-md border-2 bg-white shadow-2xl h-2/3 w-2/3">
                    <div>
                    <h2>{userToView.displayName}</h2>
                    <h2>{`@${userToView.username}`}</h2>
                    </div>
                    member since : {dateStr}
                    <h2> Game Stats </h2>
                    <UserStats username={userToView.username} privateProfile={userToView.privateProfile} currentUser={currentUser}/>
                    {userToView.id == currentUser.id ? editProfileElement : null}
                </section>
        )
    }
}

export default ProfilePage

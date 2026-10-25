import { useParams } from 'react-router'
import UserStats from '../components/UserStats.tsx'
import { Link } from 'react-router'
import { ProfileDetails} from '../components/profile/ProfileDetails.tsx'
import { useUser } from '../components/hooks/useUser.tsx'
import { useAuth } from '../AuthProvider.tsx'

function ProfilePage() {
    const params = useParams();
    const auth = useAuth();
    const user = useUser(params.username);

    if (user.status !== "loaded")
    {
        if (user.status === "notFound")
        {
            if (user.status === "notFound")
                return (<p> this user does not exist </p>)
            return (<p>error loading user</p>)
        }
        else if (user.status === "loading")
            return (<p> loading </p>)

        return (<p> error </p>)
    }

    return (
                <section className="flex flex-col justify-center items-center rounded-md border-2 bg-white shadow-2xl h-2/3 w-2/3">
                    <div>
                        <ProfileDetails userToView={user.user}/>
                        <UserStats username={user.user.username} />
                        {auth.authState.authStatus!== "logged-in" || auth.authState.user.username !== user.user.username? null : <Link to="/editProfile"> edit profile </Link>}
                    </div>
                </section>
        )
}

export default ProfilePage

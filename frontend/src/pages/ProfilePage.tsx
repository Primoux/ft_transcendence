import { Link, useParams } from 'react-router'
import UserStats from '../components/UserStats.tsx'
import { ProfileDetails } from '../components/profile/ProfileDetails.tsx'
import { useUser } from '../components/hooks/useUser.tsx'
import { useAuth } from '../useAuth.ts'
import MyFriendList from '../components/friends/MyFriendList.tsx'
import Spinner from '../components/Spinner.tsx'

function ProfilePage() {
    const params = useParams()
    const auth = useAuth()
    const user = useUser(params.username)

    if (user.status === "loading") {
        return (<Spinner />)
    }
    if (user.status === "notFound") {
        return (<p>This user does not exist.</p>)
    }
    if (user.status === "error") {
        return (<p>Error while loading this profile.</p>)
    }

    const isOwnProfile = auth.authState.authStatus === "logged-in"
        && auth.authState.user.username === user.user.username

    return (
        <div className="flex flex-col lg:flex-row gap-4 items-start justify-center w-full max-w-4xl">
            <section className="card bg-base-100 border border-base-300 shadow-xl w-full lg:flex-1">
                <div className="card-body gap-4">
                    <ProfileDetails userToView={user.user} />
                    <UserStats username={user.user.username} />
                    {!isOwnProfile ? null : (
                        <Link to="/editProfile" className="btn btn-primary btn-sm self-start">
                            Edit profile
                        </Link>
                    )}
                </div>
            </section>
			<div className="divider divider-horizontal"></div>
            {!isOwnProfile ? null : <MyFriendList />}
        </div>
    )
}

export default ProfilePage

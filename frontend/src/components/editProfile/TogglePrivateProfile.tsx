import { useAuth } from '../../useAuth'
import type { User } from '../../types/user'

type TogglePrivateProfileProps = {
    user: User
}
export function TogglePrivateProfile({user}: TogglePrivateProfileProps) {
    const auth = useAuth()
    
    async function handleSubmitPrivateProfile(e: React.SubmitEvent<HTMLFormElement>) {
            e.preventDefault()
            try{
                const response = await fetch(`/api/users/me/privateProfile`, {
                    method: "PATCH",
                })
                if (response.ok) {await auth.refreshUser()}
            }
            catch (err) {
                console.log(err)
            } 
    }

    
    return(
            <>
                <form className="border-1 p-3 m-3" onSubmit={handleSubmitPrivateProfile}>
                <p>Your profile stats are currently {user.privateProfile ? "private" : "public"}.</p>
                <button className="button">Toggle</button>
                </form>
            </>
    )
}
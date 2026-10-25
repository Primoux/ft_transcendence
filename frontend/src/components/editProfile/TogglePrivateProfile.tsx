import {useState} from 'react'
import { useAuth } from '../../AuthProvider'

export function TogglePrivateProfile() {
    const auth = useAuth()
    const [loading, setLoading] = useState(false)

    if (auth.authState.authStatus !== "logged-in")
    {
        if (auth.authState.authStatus === "loading")
            return (<p>loading</p>)
        if (auth.authState.authStatus === "logged-out")
            return (<p>you are logged out.</p>)
        return (<p>error</p>)
    }

    async function handleSubmitPrivateProfile(e: React.SubmitEvent<HTMLFormElement>) {
            e.preventDefault()
            try{
                setLoading(true)
                const response = await fetch(`/api/users/me/privateProfile`, {
                    method: "PATCH",
                })
                if (response.ok) {await auth.refreshUser()}
            }
            catch (err) {
                console.log(err)
            } finally {
                setLoading(false)
            }
        }

    
    return(
            <>
                <form className="border-1 p-3 m-3" onSubmit={handleSubmitPrivateProfile}>
                <p>Your profile stats are currently {auth.authState.user.privateProfile ? "private" : "public"}.</p>
                <button className="button" disabled={loading}> {loading? "loading..." : "Toggle" }</button>
                </form>
            </>
    )
}
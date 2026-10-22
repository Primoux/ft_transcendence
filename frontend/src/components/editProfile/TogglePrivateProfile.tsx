import {useState} from 'react'
import type { User } from '../../types/user'

type TogglePrivateProfileProps = {user: User}
export function TogglePrivateProfile({user}: TogglePrivateProfileProps) {
    const [loading, setLoading] = useState(false)
    const [isPrivate, setIsPrivate] = useState(user.privateProfile)

    async function handleSubmitPrivateProfile(e: React.SubmitEvent<HTMLFormElement>) {
            e.preventDefault()
            try{
                setLoading(true)
                const response = await fetch(`/api/users/me/privateProfile`, {
                    method: "PATCH",
                    headers: {"Content-Type": "application/json"},
                })
                if (response.ok) {setIsPrivate(!isPrivate)}
            }
            catch (err) {
            } finally {
                setLoading(false)
            }
        }

    return(
            <>
                <form className="border-1 p-3 m-3" onSubmit={handleSubmitPrivateProfile}>
                <p>Your profile stats are currently {isPrivate ? "private" : "public"}.</p>
                <button className="button" disabled={loading}> {loading? "loading..." : "Toggle" }</button>
                </form>
            </>
    )
}
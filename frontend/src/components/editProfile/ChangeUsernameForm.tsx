import {useState} from 'react'
import TextField from '../auth/TextField'
import type { User } from '../../types/user'
import { useAuth } from '../../useAuth'

type ChangeUsernameFormProps = {user: User}
export function ChangeUsernameForm({user}: ChangeUsernameFormProps) {
    const [newUsername, setNewUsername] = useState<string>(user.username)
    const [message, setMessage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const auth = useAuth()

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
            e.preventDefault()
            try{
                setLoading(true)
                const response = await fetch(`/api/users/me/username`, {
                    method: "PATCH",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({newUsername}),
                })
                const body = await response.json()
                if (!response.ok) { setMessage(body.error || body.fieldErrors?.newUsername?.[0] || "unknown error")}
                else {
                    setMessage("username changed")
                    await auth.refreshUser()  // the username is shown elsewhere (profile link, header)
                }
            }
            catch (err) {
                console.error(err)
                setMessage("Could not reach the server")
            } finally {
                setLoading(false)
            }
        }

    return(
            <>
                <form className="border-1 p-3 m-3" onSubmit={handleSubmit}>
                <TextField
                    id="new-username"
                    label="new username"
                    value={newUsername}
                    placeholder="jace_beleren"
                    autoComplete="username"
                    onChange={setNewUsername}
                    minLength={3}
                    maxLength={15}
                    hint="3 to 15 letters, digits or underscores"
                />
                <button className="button" disabled={loading}> {loading? "loading..." : "Submit" }</button>
                <p> {message} </p>
                </form>
            </>
    )
}

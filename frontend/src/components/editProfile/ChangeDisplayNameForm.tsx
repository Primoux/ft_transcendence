import {useState} from 'react'
import TextField from '../auth/TextField'
import type { User } from '../../types/user'

type ChangeDisplayNameFormProps = {user: User}
export function ChangeDisplayNameForm({user}: ChangeDisplayNameFormProps) {
    const [newDisplayName, setNewDisplayName] = useState<string>(user.displayName)
    const [displayNameErrorMsg, setDisplayNameErrorMsg] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmitDisplayName(e: React.SubmitEvent<HTMLFormElement>) {
            e.preventDefault()
            try{
                setLoading(true)
                const response = await fetch(`/api/users/me/displayName`, {
                    method: "PATCH",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({newDisplayName}),
                })
                const body = await response.json()
                if (!response.ok) { setDisplayNameErrorMsg(body.error || "unknown error")}
                else {setDisplayNameErrorMsg("display name changed")}
            }
            catch (err) {
                console.error(err)
                setDisplayNameErrorMsg ("Could not reach the server")
            } finally {
                setLoading(false)
            }
        }

    return(
            <>
                <form className="border-1 p-3 m-3" onSubmit={handleSubmitDisplayName}>
                <TextField 
                    id="new display name" 
                    label="new display name"
                    value={newDisplayName}
                    placeholder="Jace Beleren"
                    autoComplete="jace"
                    onChange={setNewDisplayName}
                />
                <button className="button" disabled={loading}> {loading? "loading..." : "Submit" }</button>
                <p> {displayNameErrorMsg} </p>
                </form>
            </>
    )
}
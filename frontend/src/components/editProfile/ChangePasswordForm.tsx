import {useState} from 'react'
import PasswordField from '../auth/PasswordField'

export function ChangePasswordForm() {
    const [newPassword, setNewPassword] = useState<string>("")
    const [currentPassword, setCurrentPassword] = useState<string>("")
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState<string>("")
    const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmitPassword(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        try{
            setLoading(true)
            const response = await fetch(`/api/users/me/changePassword`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({currentPassword, newPassword, newPasswordConfirmation}),
            })
            const body = await response.json()
            if (!response.ok) { setPasswordErrorMsg(body.error || "unknown error")}
            else {setPasswordErrorMsg("password changed")}
        }
        catch (err) {
            setPasswordErrorMsg ("Could not reach the server")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return(
            <>
                <form className="p-3 m-3 border-1 border-red" onSubmit={handleSubmitPassword}>
                <PasswordField
                    id="current password" 
                    label="current password"
                    value={currentPassword}
                    placeholder=""
                    autoComplete="new-password"
                    onChange={setCurrentPassword}
                />
                <PasswordField 
                    id="new password" 
                    label="new password"
                    value={newPassword}
                    placeholder=""
                    autoComplete="new-password"
                    onChange={setNewPassword}
                />
                <PasswordField 
                    id="confirm new password" 
                    label="confirm new password"
                    value={newPasswordConfirmation}
                    placeholder=""
                    autoComplete="new-password"
                    onChange={setNewPasswordConfirmation}
                />

                <button className="button" disabled={loading}> {loading? "loading..." : "Submit" }</button>
                </form>
                <p> {passwordErrorMsg} </p>
            </>
    )
}
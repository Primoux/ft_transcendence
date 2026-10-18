import { useState} from "react"
import type { User } from '../../types/user'
type RegisterFormProps = {onLogin: (user : User) => void}
import { Link } from 'react-router';
import AuthLayout from './AuthLayout'
import TextField from './TextField'
import PasswordField from './PasswordField'
import SubmitButton from './SubmitButton'
import FormError from './FormError'

export default function RegisterForm({onLogin} : RegisterFormProps) {
	const [username, setUsername] = useState('');
	const [displayName, setDisplayName] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)


    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
		console.log("registering user : " + username + "\n display name: " + displayName)
        e.preventDefault()
        setErrorMsg(null)
        setLoading(true)
        try{
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username: username, password: password, displayName: displayName}),
            })
			const data = await response.json()
            if (!response.ok) {
				setErrorMsg(data.error)
			}
			else {onLogin(data)}
        }
        catch (err) {
			console.error(err)
            setErrorMsg ("Could not reach the server")
        } finally {
            setLoading(false)
        }
    }

	const subtitle = (
		<>
			Already have an account?{' '}
			<Link to="/login" className="underline">
				Log in
			</Link>
		</>
	)

	return (
		<AuthLayout title="Create an account" subtitle={subtitle} onSubmit={handleSubmit}>
			<div className="flex flex-col gap-4">
				<TextField
					id="username"
					label="Username"
					value={username}
					onChange={setUsername}
					placeholder="Username"
					autoComplete="username"
				/>
				<TextField
					id="displayName"
					label="Display name"
					value={displayName}
					onChange={setDisplayName}
					placeholder="Display name"
					autoComplete="nickname"
				/>
				<PasswordField
					id="password"
					label="Password"
					value={password}
					onChange={setPassword}
					placeholder="Password"
					autoComplete="new-password"
				/>
				<PasswordField
					id="confirmPassword"
					label="Confirm password"
					value={confirmPassword}
					onChange={setConfirmPassword}
					placeholder="Confirm password"
					autoComplete="new-password"
				/>
			</div>

			<SubmitButton loading={loading} label="Create account" loadingLabel="Creating account…" />
			<FormError message={errorMsg} />
		</AuthLayout>
	);
}

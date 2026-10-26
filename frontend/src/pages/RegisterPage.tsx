import { useState} from "react"
import type { User } from '../types/user'
type RegisterPageProps = {onLogin: (user : User) => void}
import { Link } from 'react-router';
import AuthLayout from '../components/auth/AuthLayout'
import TextField from '../components/auth/TextField'
import PasswordField from '../components/auth/PasswordField'
import SubmitButton from '../components/auth/SubmitButton'
import FormError from '../components/auth/FormError'
import { User as UserIcon, KeyRound, IdCard } from 'lucide-react'

export default function RegisterPage({onLogin} : RegisterPageProps) {
	const [username, setUsername] = useState('');
	const [displayName, setDisplayName] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)


    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        if (password !== confirmPassword) {
            setErrorMsg("Passwords must match")
            return
        }
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
					icon={<UserIcon className="h-[1em] opacity-50" />}
					minLength={3}
					maxLength={15}
					hint="Must be 3 to 15 characters"
				/>
				<TextField
					id="displayName"
					label="Display name"
					value={displayName}
					onChange={setDisplayName}
					placeholder="Display name"
					autoComplete="nickname"
					icon={<IdCard className="h-[1em] opacity-50" />}
					maxLength={30}
					hint="Shown to other players. At most 30 characters."
				/>
				<PasswordField
					id="password"
					label="Password"
					value={password}
					onChange={setPassword}
					placeholder="Password"
					autoComplete="new-password"
					icon={<KeyRound className="h-[1em] opacity-50" />}
					minLength={8}
					maxLength={72}
					hint="Must be 8 to 72 characters"
				/>
				<PasswordField
					id="confirmPassword"
					label="Confirm password"
					value={confirmPassword}
					onChange={setConfirmPassword}
					placeholder="Confirm password"
					autoComplete="new-password"
					icon={<KeyRound className="h-[1em] opacity-50" />}
					minLength={8}
					maxLength={72}
					hint="Passwords must match"
				/>
			</div>

			<SubmitButton loading={loading} label="Create account" loadingLabel="Creating account…" />
			<FormError message={errorMsg} />
		</AuthLayout>
	);
}

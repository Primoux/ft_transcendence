import { useState} from "react"
import type { User } from './types/user'
type RegisterFormProps = {onLogin: (user : User) => void}
import { Link } from 'react-router';

export default function RegisterForm({onLogin} : RegisterFormProps) {
	const [username, setUsername] = useState('');
	const [displayname, setDisplayName] = useState('');
	const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)


    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
		console.log("registering user : " + username + "\n display name: " + displayname)
        e.preventDefault()
        setErrorMsg(null)
        setLoading(true)
        try{
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username: username, password: password, displayName: displayname}),
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

	return (
		<>
			<h1>Create an Account</h1>
			<form onSubmit={handleSubmit}>
				<label>
					username
					<input
						name="username"
						placeholder="username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
				</label>
				<label>
					display name
					<input
						name="displayname"
						placeholder="display name"
						value={displayname}
						onChange={(e) => setDisplayName(e.target.value)}
					/>
				</label>
				<label>
					password
					<input
						type="password"
						name="password"
						placeholder="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</label>

				<button disabled={loading} type="submit">Register</button>
				{errorMsg && <p> {errorMsg} </p>}
				<Link to="/login">I already have an account</Link>

			</form>
		</>
	);
}

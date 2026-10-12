import { useState} from "react"
import type { User } from './types/user'
type RegisterFormProps = {onLogin: (user : User) => void}
import { Link } from 'react-router';

export default function RegisterForm({onLogin} : RegisterFormProps) {
	const [username, setUsername] = useState('');
	const [displayname, setDisplayName] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
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
		<div className="flex flex-col justify-around items-center h-full">
            <form onSubmit={handleSubmit} className="flex flex-col justify-between items-center rounded-sm w-md border-1">
            <h1>Register</h1>
                <div className="m-5 flex flex-col items-center justify-between">
                    <label className="text-center"> username <br />
                        <input className="p-2 border-orange border-1" value={username} onChange={(e) => setUsername(e.target.value)} name="username" placeholder="username" />
                    </label>
                </div>
				<div className="m-5 flex flex-col items-center justify-between">
						<label className="text-center"> Display Name <br />
							<input className="p-2 border-orange border-1" value={username} onChange={(e) => setDisplayName(e.target.value)} name="username" placeholder="username" />
						</label>
                </div>
                <div className="m-5 flex flex-col items-center">
					<label className="text-center"> password <br />
						<input className="p-2 border-1 border-orange" value={password} onChange={(e) => setPassword(e.target.value)} type="password" name="password" placeholder="password" />
					</label>
                </div>
				<div className="m-5 flex flex-col items-center">
					<label className="text-center"> confirm password <br />
						<input className="p-2 border-1 border-orange" value={password} onChange={(e) => setConfirmPassword(e.target.value)} type="password" name="password" placeholder="password" />
					</label>
                </div>
                <button disabled={loading} className="rounded-sm bg-green p-1">Register</button>
                {errorMsg && <p> {errorMsg} </p>}
                <Link to="/login" className="underline p-2">I already have an account</Link>
            </form>
        </div>
	);
}

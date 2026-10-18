import { useState} from "react"
import type { User } from '../../types/user'
type RegisterFormProps = {onLogin: (user : User) => void}
import { Link } from 'react-router';

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

	return (
		<div className="flex flex-col justify-around items-center justify-items-center h-full">
            <form onSubmit={handleSubmit} className="border-1 flex flex-col justify-around items-center rounded-sm w-md  bg-white h-9/10">
            <h1 className=" text-5xl text-black h-1/8">Register</h1>
                <div className="flex flex-col items-center justify-between">
                    <label className="font-bold text-center"> username <br />
                        <input className="focus:outline-hidden p-2 border-orange border-1" value={username} onChange={(e) => setUsername(e.target.value)} name="username" placeholder="username" />
                    </label>
                </div>
				<div className="flex flex-col items-center justify-between text-start">
						<label className="font-bold text-center"> display name <br />
							<input className="focus:outline-hidden p-2 border-orange border-1" value={displayName} onChange={(e) => setDisplayName(e.target.value)} name="username" placeholder="username" />
						</label>
                </div>
                <div className="flex flex-col items-center ">
					<label className="font-bold text-center"> password <br />
						<input className="focus:outline-hidden p-2 border-1 border-orange" value={password} onChange={(e) => setPassword(e.target.value)} type="password" name="password" placeholder="password" />
					</label>
                </div>
				<div className="flex flex-col items-center ">
					<label className="font-bold text-center"> confirm password <br />
						<input className="focus:outline-hidden p-2 border-1 border-orange" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" name="password" placeholder="password" />
					</label>
                </div>
					<div className="registerMenu h-2/8 grid grid-rows-3 grid-cols-1 text-center">
						<button disabled={loading} className="rounded-sm bg-orange font-bold">Register</button>
						<div className="min-h-8 text-orange self-center align-middle "> {errorMsg} </div>
						<Link to="/login" className="underline p-2">I already have an account</Link>
					</div>
            </form>
        </div>
	);
}

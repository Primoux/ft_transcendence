import { useState} from "react"
import type { User } from './types/user'
type LoginFormProps = {onLogin: (user: User) => void}
import { Link } from "react-router"

function LoginForm({ onLogin } : LoginFormProps) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        setErrorMsg(null)
        setLoading(true)
        try{
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username: username, password: password}),
            })
            const body = await response.json()
            if (!response.ok) { setErrorMsg(body.error || "unknown error")}
            else {onLogin(body)}
        }
        catch (err) {
            setErrorMsg ("Could not reach the server")
        } finally {
            setLoading(false)
        }
    }

    return (
		<div className="flex flex-col justify-around items-center h-full">
            <form onSubmit={handleSubmit} className="flex flex-col justify-between items-center rounded-sm w-md border-1">
            <h1>Login</h1>
                <div className="m-5 flex flex-col items-center justify-between">
                    <label className="text-center"> username <br />
                        <input className="p-2 border-orange border-1" value={username} onChange={(e) => setUsername(e.target.value)} name="username" placeholder="username" />
                    </label>
                </div>
                <div className="m-5 flex flex-col items-center">
                <label className="text-center"> password <br />
                    <input className="p-2 border-1 border-orange" value={password} onChange={(e) => setPassword(e.target.value)} type="password" name="password" placeholder="password" />
                </label>
                </div>
                <button disabled={loading} className="rounded-sm bg-green p-1">Login</button>
                {errorMsg && <p> {errorMsg} </p>}
                <Link to="/register" className="underline p-2">I don't have an account</Link>
            </form>
        </div>
    )
}

export default LoginForm 
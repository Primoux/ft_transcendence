import { useState} from "react"
import type { User } from '../../types/user'
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
            <form onSubmit={handleSubmit} className="flex flex-col justify-around items-center rounded-md w-md border-2 bg-white border-solid shadow-2xl">
            <h1 className=" text-5xl text-black h-1/8">Login</h1>
                <div className="m-5 flex flex-col items-center justify-between">
                    <label className="text-center font-bold"> username <br />
                        <input className="focus:outline-hidden p-2 border-orange border-1" value={username} onChange={(e) => setUsername(e.target.value)} name="username" placeholder="username" />
                    </label>
                </div>
                <div className="m-5 flex flex-col items-center">
                <label className="text-center font-bold"> password <br />
                    <input className="focus:outline-hidden p-2 border-1 border-orange" value={password} onChange={(e) => setPassword(e.target.value)} type="password" name="password" placeholder="password" />
                </label>
                </div>
                <div className="registerMenu h-2/8 grid grid-rows-3 grid-cols-1 text-center">
                    <button disabled={loading} className="rounded-sm bg-orange font-bold">Login</button>
                    <div className="min-h-8 text-orange self-center align-middle "> {errorMsg} </div>
                    <Link to="/register" className="underline p-2">I don't have an account</Link>
                </div>
            </form>
        </div>
    )
}

export default LoginForm 
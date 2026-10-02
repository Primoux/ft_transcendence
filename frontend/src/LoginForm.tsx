import { useState} from "react"

function LoginForm() {
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
            if (!response.ok) { setErrorMsg("Invalid credentials")}
        }
        catch (err) {
            setErrorMsg ("Could not reach the server")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <label> username 
                <input value={username} onChange={(e) => setUsername(e.target.value)} name="username" placeholder="username" />
            </label>
            <label> password
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" name="password" placeholder="password" />
            </label>
            <button disabled={loading}>Login</button>
            {errorMsg && <p> {errorMsg} </p>}
        </form>
    )
}

export default LoginForm 
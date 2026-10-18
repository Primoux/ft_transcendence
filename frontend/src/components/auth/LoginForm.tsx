import { useState} from "react"
import type { User } from '../../types/user'
type LoginFormProps = {onLogin: (user: User) => void}
import { Link } from "react-router"
import AuthLayout from './AuthLayout'
import TextField from './TextField'
import PasswordField from './PasswordField'
import SubmitButton from './SubmitButton'
import FormError from './FormError'

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

    const subtitle = (
        <>
            Don't have an account?{' '}
            <Link to="/register" className="underline">
                Register
            </Link>
        </>
    )

    return (
        <AuthLayout title="Welcome back" subtitle={subtitle} onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
                <TextField
                    id="username"
                    label="username"
                    value={username}
                    onChange={setUsername}
                    placeholder="Username"
                    autoComplete="username"
                />
                <PasswordField
                    id="password"
                    label="password"
                    value={password}
                    onChange={setPassword}
                    placeholder="Password"
                    autoComplete="current-password"
                />
            </div>

            <SubmitButton loading={loading} label="Log in" loadingLabel="Logging in…" />
            <FormError message={errorMsg} />
        </AuthLayout>
    )
}

export default LoginForm

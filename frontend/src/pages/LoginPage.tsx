import { useState} from "react"
import { Link } from "react-router"
import AuthLayout from '../components/auth/AuthLayout'
import TextField from '../components/auth/TextField'
import PasswordField from '../components/auth/PasswordField'
import SubmitButton from '../components/auth/SubmitButton'
import FormError from '../components/auth/FormError'
import { User as UserIcon, KeyRound } from 'lucide-react'
import {useAuth} from '../useAuth'

function LoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const auth = useAuth()

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        setErrorMsg(null)
        setLoading(true)
        const response = await auth.login({username, password})
        if (response.user === null) {setErrorMsg(response.error)}
        setLoading(false)
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
                        label="Username"
                        value={username}
                        onChange={setUsername}
                        placeholder="Username"
                        autoComplete="username"
                        icon={<UserIcon className="h-[1em] opacity-50" />}
                    />
                    <PasswordField
                        id="password"
                        label="Password"
                        value={password}
                        onChange={setPassword}
                        placeholder="Password"
                        autoComplete="current-password"
                        icon={<KeyRound className="h-[1em] opacity-50" />}
                    />
                </div>

                <SubmitButton loading={loading} label="Log in" loadingLabel="Logging in…" />
                <FormError message={errorMsg} />
            </AuthLayout>
    )
}

export default LoginPage

import { Link } from 'react-router'
import AuthLayout from '../components/auth/AuthLayout'
import CodeForm from '../components/auth/CodeForm'
import { useAuth } from '../useAuth'

// Second step of login when 2FA is on. Reached from LoginPage (password login)
// or directly by the Discord callback's redirect.
function TwoFactorLoginPage() {
    const auth = useAuth()

    async function verify(code: string): Promise<string | null> {
        const result = await auth.verifyLogin(code) 
        
        if (result.status === "error") {return result.error}
        return null
    }

    const subtitle = (
        <>
            Enter the code we just emailed you.{' '}
            <Link to="/login" className="underline">Back to login</Link>
        </>
    )

    return (
        <AuthLayout title="Two-factor authentication" subtitle={subtitle}>
            <CodeForm onSubmit={verify} submitLabel="Log in" />
        </AuthLayout>
    )
}

export default TwoFactorLoginPage

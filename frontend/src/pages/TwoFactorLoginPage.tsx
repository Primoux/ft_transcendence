import { Link, useSearchParams } from 'react-router'
import AuthLayout from '../components/auth/AuthLayout'
import CodeForm from '../components/auth/CodeForm'
import { useAuth } from '../useAuth'

// Second step of login when 2FA is on. Reached from LoginPage (password login)
// or directly by the Discord callback's redirect.
const NEW_CODE_INSTRUCTION = "Enter the code we just emailed you."
const PREVIOUS_CODE_INSTRUCTION = "Your previous code is still valid"
function TwoFactorLoginPage() {
    const auth = useAuth()
    const [searchParams] = useSearchParams()
    const instruction = ((searchParams.get("reused") ?? null) ? PREVIOUS_CODE_INSTRUCTION : NEW_CODE_INSTRUCTION)

    async function verify(code: string): Promise<string | null> {
        const result = await auth.verifyLogin(code)

        if (result.status === "error") { return result.error }
        return null
    }

    const subtitle = (
        <>
            {instruction}{' '}
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

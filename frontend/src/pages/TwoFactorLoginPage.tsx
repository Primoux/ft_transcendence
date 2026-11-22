import { Link } from 'react-router'
import AuthLayout from '../components/auth/AuthLayout'
import CodeForm from '../components/auth/CodeForm'

// Second step of login when 2FA is on. Reached from LoginPage (password login)
// or directly by the Discord callback's redirect.
function TwoFactorLoginPage() {

    // TODO(you): send the code to POST /api/auth/login/verify (through the auth context,
    // since success must set the logged-in state). Return null or an error message.
    // Think about what to do on a 401 (no ticket, or an expired one).
    async function verify(code: string): Promise<string | null> {
        void code
        return "Not implemented yet"
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

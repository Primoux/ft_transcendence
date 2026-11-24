import { useState } from 'react'
import { Mail } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout'
import CodeForm from '../components/auth/CodeForm'
import TextField from '../components/auth/TextField'
import FormError from '../components/auth/FormError'
import { useAuth } from '../useAuth'
import { api } from '../api.ts'

// Shown to logged-in users whose email isn't verified yet. User.email is only set once
// verified, so we can't display the pending address here.
function VerifyEmailPage() {
    const auth = useAuth()
    const [newEmail, setNewEmail] = useState("")
    const [addressMsg, setAddressMsg] = useState<string | null>(null)

    // On success, make App.tsx notice that emailVerifiedAt is now set.
    // Return null on success, or the error message to display.
    async function verify(code: string): Promise<string | null> {
        const result = await api("/api/auth/email/verify", { method: "POST", body: { code } })
        if (!result.ok) return result.error

        await auth.refreshUser()
        return null
    }

    async function resend(): Promise<string | null> {
        const result = await api("/api/auth/email/resend", { method: "POST" })
        if (!result.ok) return result.error

        return null
    }

    // Needed for typos, and for Discord accounts that came without a usable email.
    async function sendToOtherAddress(email: string): Promise<string | null> {
        const result = await api("/api/auth/email", { method: "POST", body: { newEmail: email } })
        if (!result.ok) return result.error

        return null
    }

    async function handleOtherAddress(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        setAddressMsg(null)
        const err = await sendToOtherAddress(newEmail)
        setAddressMsg(err ?? `Code sent to ${newEmail}.`)
    }

    return (
        <AuthLayout
            title="Check your inbox"
            subtitle="We sent a 6-digit code to your email address. It expires in 5 minutes."
        >
            <CodeForm onSubmit={verify} onResend={resend} />

            <div className="divider">Wrong address, or no email received?</div>
            <form onSubmit={handleOtherAddress} className="flex flex-col gap-2">
                <TextField
                    id="newEmail"
                    label="Email"
                    type="email"
                    value={newEmail}
                    onChange={setNewEmail}
                    placeholder="you@example.com"
                    autoComplete="email"
                    icon={<Mail className="h-[1em] opacity-50" />}
                />
                <button className="btn btn-outline btn-sm">Send a code to this address</button>
                <FormError message={addressMsg} />
            </form>

            <button type="button" className="btn btn-ghost btn-sm" onClick={auth.logout}>
                Log out
            </button>
        </AuthLayout>
    )
}

export default VerifyEmailPage

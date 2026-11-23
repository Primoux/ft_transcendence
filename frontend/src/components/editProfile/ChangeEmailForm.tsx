import { useState } from 'react'
import { Mail, KeyRound } from 'lucide-react'
import type { User } from '../../types/user'
import TextField from '../auth/TextField'
import CodeForm from '../auth/CodeForm'
import FormError from '../auth/FormError'
import { useAuth } from '../../useAuth'

type ChangeEmailFormProps = { user: User }

// "idle":        current address + "Change" button
// "enter-new":   new address (+ the code sent to the current address, when 2FA is on)
// "confirm-new": code sent to the new address
type Step = "idle" | "enter-new" | "confirm-new"

export function ChangeEmailForm({ user }: ChangeEmailFormProps) {
    const [step, setStep] = useState<Step>("idle")
    const [newEmail, setNewEmail] = useState("")
    const [currentCode, setCurrentCode] = useState("")
    const [error, setError] = useState<string | null>(null)
    const twoFactorOn = user.twoFactorEnabledAt !== null
    const auth = useAuth()

    async function sendCodeToCurrent(): Promise<string | null> {
        try {
            const response = await fetch("/api/auth/email/send-change-otp", {
                method: "POST",
            })
            const body = await response.json()
            if (!response.ok) { return body.error }

            return null
        } catch (error) {
            console.error(error)
            return "could not reach the server"
        }
    }

    async function requestChange(email: string, code: string | null): Promise<string | null> {
        try {
            const response = await fetch("/api/auth/email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newEmail: email, code: code }),
            })

            const body = await response.json()
            if (!response.ok) { return body.error }

            return null
        } catch (error) {
            console.error(error)
            return "could not reach the server"
        }
    }

    async function confirmNewEmail(code: string): Promise<string | null> {
        try {
            const response = await fetch("/api/auth/email/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            })

            const body = await response.json()
            if (!response.ok) { return body.error }
            await auth.refreshUser()

            return null
        } catch (error) {
            console.error(error)
            return "could not reach the server"
        }
    }

    async function handleStart() {
        setError(null)
        if (twoFactorOn) {
            const err = await sendCodeToCurrent()
            if (err) return setError(err)
        }
        setStep("enter-new")
    }

    async function handleNewEmail(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        const err = await requestChange(newEmail, twoFactorOn ? currentCode : null)
        if (err) setError(err)
        else setStep("confirm-new")
    }

    async function handleConfirm(code: string) {
        const err = await confirmNewEmail(code)
        if (!err) {
            setStep("idle")
            setNewEmail("")
            setCurrentCode("")
        }
        return err
    }

    function cancel() {
        setStep("idle")
        setError(null)
    }

    return (
        <div className="p-3 m-3 border-1 border-red flex flex-col gap-2">
            <p>Email: <strong>{user.email ?? "none"}</strong></p>

            {step === "idle" && (
                <button type="button" className="btn btn-sm" onClick={handleStart}>Change email</button>
            )}

            {step === "enter-new" && (
                <form onSubmit={handleNewEmail} className="flex flex-col gap-2">
                    {twoFactorOn && <p>We sent a code to your current address to confirm it's you.</p>}
                    <TextField
                        id="newEmail"
                        label="New email"
                        type="email"
                        value={newEmail}
                        onChange={setNewEmail}
                        placeholder="you@example.com"
                        autoComplete="email"
                        icon={<Mail className="h-[1em] opacity-50" />}
                    />
                    {twoFactorOn && (
                        <TextField
                            id="currentCode"
                            label="Code sent to your current address"
                            value={currentCode}
                            onChange={setCurrentCode}
                            placeholder="123456"
                            autoComplete="one-time-code"
                            icon={<KeyRound className="h-[1em] opacity-50" />}
                            minLength={6}
                            maxLength={6}
                        />
                    )}
                    <button className="btn btn-sm btn-primary">Continue</button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={cancel}>Cancel</button>
                </form>
            )}

            {step === "confirm-new" && (
                <>
                    <p>We sent a code to <strong>{newEmail}</strong>.</p>
                    <CodeForm onSubmit={handleConfirm} submitLabel="Confirm new email" />
                    <button type="button" className="btn btn-ghost btn-sm" onClick={cancel}>Cancel</button>
                </>
            )}

            <FormError message={error} />
        </div>
    )
}

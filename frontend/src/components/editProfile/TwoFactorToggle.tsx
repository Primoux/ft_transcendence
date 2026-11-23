import { useState } from 'react'
import type { User } from '../../types/user'
import CodeForm from '../auth/CodeForm'
import FormError from '../auth/FormError'
import {useAuth} from '../../useAuth'

type TwoFactorToggleProps = { user: User }

// "idle": shows the status and the button. "confirm": a code was mailed, waiting for it.
type Step = "idle" | "confirm"

export function TwoFactorToggle({ user }: TwoFactorToggleProps) {
    const [step, setStep] = useState<Step>("idle")
    const [error, setError] = useState<string | null>(null)
    const enabled = user.twoFactorEnabledAt !== null
    const auth = useAuth()

    async function requestCode(): Promise<string | null> {
        const action = enabled ? "disable" : "enable"
        try {
            const response = await fetch(`/api/auth/2fa/${action}`, {
                    method: "POST",
            })
            const body = await response.json()
            if (!response.ok) {return body.error }
            return null
        } catch (error) {
            console.error(error)
            return "could not reach the server"
        }
    }

    async function confirm(code: string): Promise<string | null> {
        const action = enabled ? "disable" : "enable"
        try {
            const response = await fetch(`/api/auth/2fa/${action}/verify`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({code}),
            })
            const body = await response.json()
            if (!response.ok) {return body.error }
            await auth.refreshUser()
            return null
        } catch (error) {
            console.error(error)
            return "could not reach the server"
        }
    }

    async function handleStart() {
        setError(null)
        const err = await requestCode()
        if (err) setError(err)
        else setStep("confirm")
    }

    async function handleConfirm(code: string) {
        const err = await confirm(code)
        if (!err) setStep("idle")
        return err
    }

    return (
        <div className="p-3 m-3 border-1 border-red flex flex-col gap-2">
            <p>Two-factor authentication is <strong>{enabled ? "on" : "off"}</strong>.</p>
            {step === "idle" ? (
                <button type="button" className="btn btn-sm" onClick={handleStart}>
                    {enabled ? "Turn off" : "Turn on"}
                </button>
            ) : (
                <>
                    <p>We emailed you a code to confirm.</p>
                    <CodeForm onSubmit={handleConfirm} onResend={requestCode} submitLabel="Confirm" />
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep("idle")}>
                        Cancel
                    </button>
                </>
            )}
            <FormError message={error} />
        </div>
    )
}

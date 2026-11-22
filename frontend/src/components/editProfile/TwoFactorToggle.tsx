import { useState } from 'react'
import type { User } from '../../types/user'
import CodeForm from '../auth/CodeForm'
import FormError from '../auth/FormError'

type TwoFactorToggleProps = { user: User }

// "idle": shows the status and the button. "confirm": a code was mailed, waiting for it.
type Step = "idle" | "confirm"

export function TwoFactorToggle({ user }: TwoFactorToggleProps) {
    const [step, setStep] = useState<Step>("idle")
    const [error, setError] = useState<string | null>(null)
    const enabled = user.twoFactorEnabledAt !== null

    // TODO(you): POST /api/auth/2fa/enable or /api/auth/2fa/disable, depending on `enabled`.
    // Return null or an error message.
    async function requestCode(): Promise<string | null> {
        return "Not implemented yet"
    }

    // TODO(you): POST the matching /verify route with { code }, then refresh the user
    // so `enabled` flips. Return null or an error message.
    async function confirm(code: string): Promise<string | null> {
        void code
        return "Not implemented yet"
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

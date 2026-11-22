import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import SubmitButton from './SubmitButton'
import FormError from './FormError'

type CodeFormProps = {
    // Both callbacks return an error message to display, or null when it worked.
    // The form only handles the input and the loading/error display; what to call and
    // what to do on success is up to the parent.
    onSubmit: (code: string) => Promise<string | null>
    onResend?: () => Promise<string | null>
    submitLabel?: string
}

function CodeForm({ onSubmit, onResend, submitLabel = "Verify" }: CodeFormProps) {
    const [code, setCode] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [info, setInfo] = useState<string | null>(null)

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setInfo(null)
        setLoading(true)
        const err = await onSubmit(code)
        setLoading(false)
        if (err) setError(err)
    }

    async function handleResend() {
        if (!onResend) return
        setError(null)
        setInfo(null)
        const err = await onResend()
        if (err) setError(err)
        else setInfo("A new code is on its way.")
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <label htmlFor="code">6-digit code</label>
                <label className="input validator w-full">
                    <KeyRound className="h-[1em] opacity-50" />
                    <input
                        id="code"
                        name="code"
                        value={code}
                        // Digits only, 6 max: pasting "123 456" or "Code: 123456" still works.
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        pattern="\d{6}"
                        placeholder="123456"
                        required
                    />
                </label>
            </div>
            <SubmitButton loading={loading} label={submitLabel} loadingLabel="Checking…" />
            {onResend && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleResend}>
                    Send a new code
                </button>
            )}
            {info && <p className="text-success">{info}</p>}
            <FormError message={error} />
        </form>
    )
}

export default CodeForm

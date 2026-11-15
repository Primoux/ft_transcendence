import { useState } from "react"
import type { User } from "../../types/user"
import { useAuth } from "../../useAuth"
import { Avatar } from "../Avatar"

const MAX_BYTES = 2 * 1024 * 1024   // same limit as the backend; checked here only to fail fast

export function ChangeAvatarForm({ user }: { user: User }) {
    const [message, setMessage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const auth = useAuth()

    async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        e.target.value = ""   // so picking the same file again still triggers onChange
        if (!file) return
        if (file.size > MAX_BYTES) return setMessage("Image must be 2 MB or less")

        const form = new FormData()
        form.append("avatar", file)
        try {
            setLoading(true)
            const response = await fetch("/api/users/me/avatar", { method: "PATCH", body: form })
            if (!response.ok) setMessage((await response.json()).error ?? "unknown error")
            else { setMessage(null); await auth.refreshUser() }
        } catch (err) {
            console.error(err)
            setMessage("Could not reach the server")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="border-1 p-3 m-3 flex flex-col items-center gap-2">
            <Avatar user={user} />
            {/* A <label> wrapping a hidden input: clicking the "button" opens the file picker. */}
            <label className={`btn btn-sm ${loading ? "btn-disabled" : ""}`}>
                {loading ? "Uploading…" : "Change avatar"}
                <input type="file" accept="image/png,image/jpeg,image/webp"
                       className="hidden" onChange={handleChange} disabled={loading} />
            </label>
            {message && <p role="alert">{message}</p>}
        </div>
    )
}

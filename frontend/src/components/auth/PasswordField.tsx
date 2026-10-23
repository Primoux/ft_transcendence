import { useState, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'

type PasswordFieldProps = {
    id: string
    label: string
    value: string
    onChange: (value: string) => void
    placeholder: string
    autoComplete?: string
    icon?: ReactNode
    // Native validation, only passed where the rules apply (register, not login)
    minLength?: number
    maxLength?: number
    hint?: string
}

function PasswordField({ id, label, value, onChange, placeholder, autoComplete, icon, minLength, maxLength, hint } : PasswordFieldProps) {
    const [visible, setVisible] = useState(false)

    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id}>{label}</label>
            <label className="input validator w-full">
                {icon}
                <input
                    id={id}
                    name={id}
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    required
                    minLength={minLength}
                    maxLength={maxLength}
                />
                <button
                    type="button"
                    onClick={() => setVisible(!visible)}
                    className="btn btn-ghost btn-xs btn-square"
                    aria-label={visible ? "Hide password" : "Show password"}
                >
                    {visible ? <EyeOff className="h-[1em]" /> : <Eye className="h-[1em]" />}
                </button>
            </label>
            {hint && <p className="text-xs opacity-60">{hint}</p>}
        </div>
    )
}

export default PasswordField

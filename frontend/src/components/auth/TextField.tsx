import type { ReactNode } from 'react'

type TextFieldProps = {
    id: string
    label: string
    value: string
    onChange: (value: string) => void
    placeholder: string
    autoComplete?: string
    icon?: ReactNode
    minLength?: number
    maxLength?: number
    hint?: string
}

function TextField({ id, label, value, onChange, placeholder, autoComplete, icon, minLength, maxLength, hint } : TextFieldProps) {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id}>{label}</label>
            <label className="input validator w-full">
                {icon}
                <input
                    id={id}
                    name={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    required
                    minLength={minLength}
                    maxLength={maxLength}
                />

            </label>

            {hint && <p className="validator-hint hidden">{hint}</p>}
        </div>
    )
}

export default TextField

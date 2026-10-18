import { useState } from 'react'

type PasswordFieldProps = {
    id: string
    label: string
    value: string
    onChange: (value: string) => void
    placeholder: string
    autoComplete?: string
}

function PasswordField({ id, label, value, onChange, placeholder, autoComplete } : PasswordFieldProps) {
    const [visible, setVisible] = useState(false)

    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id}>{label}</label>
            <div className="flex gap-2">
                <input
                    id={id}
                    name={id}
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    className="flex-1 border-1 p-2"
                />
                <button type="button" onClick={() => setVisible(!visible)} className="border-1 px-2">
                    {visible ? "Hide" : "Show"}
                </button>
            </div>
        </div>
    )
}

export default PasswordField

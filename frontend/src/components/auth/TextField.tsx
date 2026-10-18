type TextFieldProps = {
    id: string
    label: string
    value: string
    onChange: (value: string) => void
    placeholder: string
    autoComplete?: string
}

function TextField({ id, label, value, onChange, placeholder, autoComplete } : TextFieldProps) {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id}>{label}</label>
            <input
                id={id}
                name={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoComplete={autoComplete}
                placeholder={placeholder}
                className="border-1 p-2"
            />
        </div>
    )
}

export default TextField

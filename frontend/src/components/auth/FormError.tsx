type FormErrorProps = {message: string | null}

function FormError({ message } : FormErrorProps) {
    if (!message) {
        return null
    }
    return (
        <p role="alert" className="text-error">{message}</p>
    )
}

export default FormError

type FormErrorProps = {message: string | null}

function FormError({ message } : FormErrorProps) {
    if (!message) {
        return null
    }
    return (
        <p role="alert" className="text-orange">{message}</p>
    )
}

export default FormError

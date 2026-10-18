type SubmitButtonProps = {
    loading: boolean
    label: string
    loadingLabel: string
}

function SubmitButton({ loading, label, loadingLabel } : SubmitButtonProps) {
    return (
        <button disabled={loading} className="border-1 p-2 font-bold">
            {loading ? loadingLabel : label}
        </button>
    )
}

export default SubmitButton

type SubmitButtonProps = {
    loading: boolean
    label: string
    loadingLabel: string
}

function SubmitButton({ loading, label, loadingLabel } : SubmitButtonProps) {
    return (
        	<button className="btn btn-primary btn-block" disabled={loading}>
            	{loading ? loadingLabel : label}
        	</button>
    )
}

export default SubmitButton

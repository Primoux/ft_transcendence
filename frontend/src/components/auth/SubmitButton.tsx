import Spinner from "../Spinner"

type SubmitButtonProps = {
    loading: boolean
    label: string
    loadingLabel: string
}

function SubmitButton({ loading, label, loadingLabel } : SubmitButtonProps) {
    return (
        	<button className="btn btn-primary btn-block" disabled={loading}>
            	{!loading ? label : (<><Spinner />{loadingLabel}</>)}
        	</button>
    )
}

export default SubmitButton

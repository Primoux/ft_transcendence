type SpinnerProps = {
    /** "lg" when a whole page is waiting, the default inside a piece of UI. */
    size?: "sm" | "lg"
}

function Spinner({ size = "sm" }: SpinnerProps) {
    return (
        <span className={`loading loading-spinner ${size === "lg" ? "loading-lg" : ""}`} />
    )
}

export default Spinner

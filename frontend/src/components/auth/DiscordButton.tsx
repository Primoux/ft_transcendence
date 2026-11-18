type DiscordButtonProps = {
    label: string
}

// A plain link, not a router <Link> or a fetch: the whole tab must leave for Discord's consent page,
// and the backend answers with a redirect. Same daisyUI size classes as SubmitButton, so both match.
function DiscordButton({ label } : DiscordButtonProps) {
    return (
        <a
            href="/api/auth/discord"
            className="btn btn-block border-none bg-[#5865F2] text-white hover:bg-[#4752C4]"
        >
            {/* Decorative: the label already says "Discord", so screen readers skip the image. */}
            <img src="/Discord-Symbol-White.svg" alt="" className="h-[1.1em]" />
            {label}
        </a>
    )
}

export default DiscordButton

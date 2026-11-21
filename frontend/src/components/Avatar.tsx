import type { User } from "../types/user"

type AvatarProps = {
    user: Pick<User, "avatarKey">
    className?: string
    presence?: "online" | "offline"
}

export function Avatar({ user, className = "h-24 w-24", presence }: AvatarProps) {
    const src = user.avatarKey ? `/api/uploads/${user.avatarKey}` : "/default-avatar.jpg"
    const image = <img src={src} alt="" className={`${className} rounded-full object-cover`} />
    if (presence === undefined) {
        return image
    }
    return (
        <div className={`avatar ${presence === "online" ? "avatar-online" : "avatar-offline"}`}>
            {image}
        </div>
    )
}

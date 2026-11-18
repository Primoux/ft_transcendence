import type { User } from "../types/user"

type AvatarProps = { user: Pick<User, "avatarKey">, className?: string }

export function Avatar({ user, className = "h-24 w-24" }: AvatarProps) {
    const src = user.avatarKey ? `/api/uploads/${user.avatarKey}` : "/default-avatar.jpg"
    return <img src={src} alt="" className={`${className} rounded-full object-cover`} />
}

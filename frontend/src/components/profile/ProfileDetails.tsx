import type { User } from "../../types/user";
import { Avatar } from "../Avatar";

type ProfileSectionProps = { userToView : User}

export function ProfileDetails({ userToView }: ProfileSectionProps) {

    const registerDate = new Date(userToView.createdAt)
    const dateStr = registerDate.toLocaleDateString('fr-FR', {timeZone: 'Europe/Paris'})


    return (
            <>
                <div className="flex items-center gap-4">
                    <Avatar user={userToView} />
                    <h2>{`@${userToView.username}`}</h2>
                </div>
                <p>member since : {dateStr} </p>
            </>
            )
}

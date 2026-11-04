import type { User } from "../../types/user";

type ProfileSectionProps = { userToView : User}

export function ProfileDetails({ userToView }: ProfileSectionProps) {

    const registerDate = new Date(userToView.createdAt)
    const dateStr = registerDate.toLocaleDateString('fr-FR', {timeZone: 'Europe/Paris'})


    return (
            <>
                <div>
                    <h2>{userToView.displayName}</h2>
                    <h2>{`@${userToView.username}`}</h2>
                </div>
                <p>member since : {dateStr} </p>
            </>
            )
}
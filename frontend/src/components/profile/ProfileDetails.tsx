import type { User } from "../../types/user";

type ProfileSectionProps = { userToView : User}

export function ProfileDetails({ userToView }: ProfileSectionProps) {

    const registerDate = new Date(userToView.createdAt)
    const dateStr = registerDate.toLocaleDateString('fr-FR', {timeZone: 'Europe/Paris'})


    return (
            <>
                <div>
                    <img
                        src={userToView.avatarKey ? `/api/uploads/${userToView.avatarKey}` : "/default-avatar.jpg"}
                        alt=""
                        className="h-24 w-24 rounded-full object-cover"
                    />
                    <h2>{`@${userToView.username}`}</h2>
                </div>
                <p>member since : {dateStr} </p>
            </>
            )
}
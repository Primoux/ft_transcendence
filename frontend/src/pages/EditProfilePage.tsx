import type { User } from '../types/user'
import { ChangeUsernameForm } from '../components/editProfile/ChangeUsernameForm'
import { ChangePasswordForm } from "../components/editProfile/ChangePasswordForm"
import { TogglePrivateProfile } from "../components/editProfile/TogglePrivateProfile"
import { ChangeAvatarForm } from '../components/editProfile/ChangeAvatarForm'

type editProfileProps = {
    user: User
}

function EditProfilePage({user}: editProfileProps) {

    return (
        <>
            <ChangeAvatarForm user={user} />
            <ChangeUsernameForm user={user}/>
            <ChangePasswordForm />
            <TogglePrivateProfile user={user}/>
        </>
        )
}

export default EditProfilePage
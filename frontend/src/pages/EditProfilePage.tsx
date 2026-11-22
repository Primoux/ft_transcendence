import type { User } from '../types/user'
import { ChangeUsernameForm } from '../components/editProfile/ChangeUsernameForm'
import { ChangePasswordForm } from "../components/editProfile/ChangePasswordForm"
import { TogglePrivateProfile } from "../components/editProfile/TogglePrivateProfile"
import { ChangeAvatarForm } from '../components/editProfile/ChangeAvatarForm'
import { ChangeEmailForm } from '../components/editProfile/ChangeEmailForm'
import { TwoFactorToggle } from '../components/editProfile/TwoFactorToggle'

type editProfileProps = {
    user: User
}

function EditProfilePage({user}: editProfileProps) {

    return (
        <>
            <ChangeAvatarForm user={user} />
            <ChangeUsernameForm user={user}/>
            <ChangePasswordForm />
            <ChangeEmailForm user={user} />
            <TwoFactorToggle user={user} />
            <TogglePrivateProfile user={user}/>
        </>
        )
}

export default EditProfilePage
import type { User } from '../types/user'
import { useEffect } from 'react'
import { useNavigate } from "react-router"
import { ChangeUsernameForm } from '../components/editProfile/ChangeUsernameForm'
import { ChangePasswordForm } from "../components/editProfile/ChangePasswordForm"
import { TogglePrivateProfile } from "../components/editProfile/TogglePrivateProfile"

type editProfileProps = {
    user: User
}

function EditProfilePage({user}: editProfileProps) {
    const goTo = useNavigate()

    useEffect(() => {
    if (!user) {
        goTo("/login")
        return
    }
    }, [user, goTo])
    
    return (
        <>
            <ChangeUsernameForm user={user}/>
            <ChangePasswordForm />
            <TogglePrivateProfile />
        </>
        )
}

export default EditProfilePage
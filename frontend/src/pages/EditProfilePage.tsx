import type { User } from '../types/user'
import { useEffect } from 'react'
import { useNavigate } from "react-router"
import {ChangeDisplayNameForm} from '../components/editProfile/ChangeDisplayNameForm'
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
    }, [])
    
    return (
        <>
            <ChangeDisplayNameForm user={user}/>
            <ChangePasswordForm />
            <TogglePrivateProfile />
        </>
        )
}

export default EditProfilePage
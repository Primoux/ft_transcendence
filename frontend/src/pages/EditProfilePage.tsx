import TextField from "../components/auth/TextField"
import type { User } from '../types/user'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from "react-router"
import {ChangeDisplayNameForm} from '../components/editProfile/ChangeDisplayNameForm'
import { ChangePasswordForm } from "../components/editProfile/ChangePasswordForm"
import { TogglePrivateProfile } from "../components/editProfile/TogglePrivateProfile"

type editProfileProps = {
    user: User
}

function EditProfilePage({user}: editProfileProps) {
    const [loading, setLoading] = useState(false)
    const goTo = useNavigate()
    const params = useParams()

    useEffect(() => {
    if (!user)
        goTo("/login")
    if (params.username === undefined || user.username !== params.username)
        goTo(`/users/${user.username}/editProfile`)
    }, [])
    
    


    return (
        <>
            <ChangeDisplayNameForm user={user}/>
            <ChangePasswordForm user={user} />
            <TogglePrivateProfile user={user} />
        </>
        )
}

export default EditProfilePage
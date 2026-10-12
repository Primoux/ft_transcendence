import type { User } from './types/user'
type WelcomeProps  = {user : User, onLogout: () => (void)}

function WelcomeParagraph({ user, onLogout } : WelcomeProps) {
    async function disconnectUser() {
        try {
            const response = await fetch("/api/auth/logout",{
                method : "POST"
            })
            if (response.ok) {onLogout()}
            else {console.error("logout failed :(")}
        } catch (error ) {
            console.error(error)
        } 
    }
    return (
        <>
            <p> welcome {user.username} aka {user.displayName}</p>
            <button onClick={disconnectUser}> logout </button>
        </>
    )
}

export default WelcomeParagraph
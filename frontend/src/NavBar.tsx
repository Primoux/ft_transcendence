import type { User } from './types/user'
import {Link, useLocation } from 'react-router'
import './NavBar.css'
type NavBarProps = {user: User, logout: () => (void)}

function NavBar( {user, logout} : NavBarProps) {
    const location = useLocation();

    async function disconnectUser() {
        try {
            const response = await fetch("/api/auth/logout",{
                method : "POST"
            })
            if (response.ok) {logout()}
            else {console.error("logout failed :(")}
        } catch (error ) {
            console.error(error)
        } 
    }
    let loginElement;
    if (user.id != 0) {
        loginElement = <button onClick={disconnectUser} className="rounded-none bground-orange p-10"> Logout </button>
    } else if (location.pathname === "/login" ){
        loginElement = <Link to="/register" className="rounded-none bground-orange p-10"> Register </Link>
    } else {
        loginElement = <Link to="/login" className="rounded-none bground-orange p-10"> Login </Link>
    } 
    const userString : string = "/users/" + user.username
    return (
        <nav className="sticky border-1 border-black w-screen flex flex-row items-center justify-between rounded-sm">
            <h1 className="p-3 justify-self-start"><Link to="/">HubDle</Link></h1>
            <Link to={userString} className="">Profile</Link>
            <Link to="/" className="">Home</Link>
            {loginElement}
        </nav>
    )
}

export default NavBar 
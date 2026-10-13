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
        loginElement = <button onClick={disconnectUser} className="w-full text-center"> Logout </button>
    } else if (location.pathname === "/login" ){
        loginElement = <Link to="/register" className="w-full text-center"> Register </Link>
    } else {
        loginElement = <Link to="/login" className="w-full text-center"> Login </Link>
    } 
    const userString : string = `/users/${user.username}`
    return (
        <nav className="sticky border-1 border-black w-screen flex flex-row items-center justify-between rounded-t-sm border-b-none bg-white">
            <h1 className="p-3 justify-self-start text-5xl text-black py-4"><Link to="/">HubDle</Link></h1>
            <div className="w-1/2 grid grid-rows-1 grid-cols-3 items-center justify-items-center divide-x-2 align-middle">
                <Link to={userString} className="w-full text-center">Profile</Link>
                <Link to="/" className="w-full text-center">Home</Link>
                {loginElement}
            </div>
        </nav>
    )
}

export default NavBar 
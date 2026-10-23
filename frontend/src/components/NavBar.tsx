import type { User } from '../types/user'
import {Link, useLocation } from 'react-router'
type NavBarProps = {user: User | null, logout: () => (void)}

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
    if (user) {
        loginElement = <button onClick={disconnectUser} className="px-4 hover:cursor-pointer" > Logout </button>
    } else if (location.pathname === "/login" ){
        loginElement = <Link to="/register" className="px-4"> Register </Link>
    } else {
        loginElement = <Link to="/login" className="px-4"> Login </Link>
    }
    return (
        <nav className="sticky border-1 border-black w-full flex flex-row items-center justify-between rounded-t-sm bg-white">
            <h1 className="px-3 text-5xl text-black py-4"><Link to="/">MtgDle</Link></h1>
            <div className="flex items-center divide-x-2 pr-4">
                {user && <Link to={`/users/${user.username}`} className="px-4">Profile</Link>}
                {loginElement}
            </div>
        </nav>
    )
}

export default NavBar

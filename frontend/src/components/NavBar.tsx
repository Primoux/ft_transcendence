import type { User } from '../types/user'
import { Link, useLocation } from 'react-router'
import { ChevronDown } from 'lucide-react'
type NavBarProps = {user: User | null, logout: () => (void)}

// the dropdown is CSS-only and stays open as long as focus is inside it,
// so every item has to drop the focus on its way out
function closeMenu() {
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
    }
}

function NavBar( {user, logout} : NavBarProps) {
    const location = useLocation();

    const authButtonClass = "btn btn-primary min-w-28"

    let accountElement;
    if (user) {
        accountElement =
        <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost gap-2">
                <span>{user.username}</span>
                <ChevronDown className="size-3 opacity-60" />
            </div>
            <ul tabIndex={0} className="menu dropdown-content bg-base-100 border border-base-300 rounded-box mt-2 w-44 p-2 shadow-xl">
                <li><Link to={`/users/${user.username}`} onClick={closeMenu}>Profile</Link></li>
                <li><button onClick={() => {closeMenu(); logout()}} className="text-error">Log out</button></li>
            </ul>
        </div>
    } else if (location.pathname === "/login") {
        accountElement = <Link to="/register" className={authButtonClass}>Register</Link>
    } else {
        accountElement = <Link to="/login" className={authButtonClass}>Log in</Link>
    }

    return (
        <div className="navbar bg-base-100 shadow-lg rounded-sm px-4">
            <div className="navbar-start">
                <Link to="/" className="font-beleren-sc btn btn-ghost px-0 text-3xl">MtgDle</Link>
            </div>
            <div className="navbar-center">
                <ul className="menu menu-horizontal gap-1">
                    <li>
                        <Link to="/dle" className={`font-matrix text-base ${location.pathname === "/dle" ? "menu-active" : ""}`}>Play</Link>
                    </li>
                </ul>
            </div>
            <div className="navbar-end">
                {accountElement}
            </div>
        </div>
    )
}

export default NavBar

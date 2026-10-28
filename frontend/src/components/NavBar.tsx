import { useAuth } from '../useAuth';
import {Link, useLocation } from 'react-router'

function NavBar() {
    const auth = useAuth()
    const location = useLocation();


    let loginElement;
    if (auth.authState.authStatus == "logged-in") {
        loginElement = <button onClick={auth.logout} className="px-4 hover:cursor-pointer" > Logout </button>
    } else if (location.pathname === "/login" ){
        loginElement = <Link to="/register" className="px-4"> Register </Link>
    } else {
        loginElement = <Link to="/login" className="px-4"> Login </Link>
    }
    return (
        <nav className="sticky border-1 border-black w-full flex flex-row items-center justify-between rounded-t-sm bg-white">
            <h1 className="px-3 text-5xl text-black py-4"><Link to="/">MtgDle</Link></h1>
            <div className="flex items-center divide-x-2 pr-4">
                {auth.authState.user && <Link to={`/users/${auth.authState.user.username}`} className="px-4">Profile</Link>}
                {loginElement}
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

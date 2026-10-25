import { useAuth } from '../AuthProvider';
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
        </nav>
    )
}

export default NavBar

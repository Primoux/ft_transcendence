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
        loginElement =
		<li>
		    <details>
		      <summary>{user?.username || <Link to="/login" className="btn btn-ghost">Login</Link>}</summary>
		      <ul className="bg-base-80 rounded-t-none p-2">
		        <li><Link to={user ? `/users/${user.username}` : "/login" } className="btn btn-ghost">Profile</Link></li>
		        <li><button onClick={disconnectUser} className="btn btn-ghost">Logout</button></li>
		      </ul>
		    </details>
		</li>
    } else if (location.pathname === "/login" ){
        loginElement =
		<li>
			<Link to="/register" className="btn btn-ghost"> Register </Link>
		</li>
    } else {
        loginElement =
		<li>
			<Link to="/login" className="btn btn-ghost w-full"> Login </Link>
		</li>
    }
    return (
			<div className="navbar bg-base-100 shadow-lg rounded-sm">
			  <div className="navbar-start">
			    <Link to="/" className="btn btn-ghost text-xl">MtgDle</Link>
			  </div>
			  <div className="navbar-center">
			    <Link to="/dle" className="btn btn-ghost">Play</Link>
			  </div>
			  <div className="navbar-end">
			    <ul className="menu menu-horizontal">
			      {loginElement}
			    </ul>
			  </div>
			</div>
    )
}

export default NavBar

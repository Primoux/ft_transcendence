import { useAuth } from '../useAuth';
import {Link, useLocation } from 'react-router'

function NavBar() {
    const auth = useAuth()
    const location = useLocation();
    const user = auth.authState.user

    let loginElement;
    if (user) {
        loginElement =
		<li>
		    <details>
		      <summary>{user.username}</summary>
		      <ul className="bg-base-80 rounded-t-none p-2">
		        <li><Link to={`/users/${user.username}`} className="btn btn-ghost">Profile</Link></li>
		        <li><button onClick={auth.logout} className="btn btn-ghost">Logout</button></li>
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

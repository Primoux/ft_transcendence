import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { Routes, Route, Navigate } from 'react-router';
import HomePage from './pages/HomePage'
import NavBar from './components/NavBar'
import ProfilePage from './pages/ProfilePage'
import DlePage from './pages/DlePage'
import EditProfilePage from './pages/EditProfilePage';
import { useAuth } from './AuthProvider';

function App() {
	const auth = useAuth()


	if (auth.authState.authStatus === "loading") {
		return (<p>loading</p>)
	}

	let loginElement, registerElement, profileElement, editProfileElement;
	if (auth.authState.authStatus == "logged-in") {
		loginElement = <Navigate to="/" replace />
		registerElement = <Navigate to="/" replace />
		profileElement = <ProfilePage />
		editProfileElement= <EditProfilePage user={auth.authState.user} />
	} else {
		loginElement = <LoginPage/>
		registerElement = <RegisterPage/>
		profileElement = <Navigate to="/login" replace />
		editProfileElement= <Navigate to="/login" replace />
	}
	let dleElement;
	dleElement = <DlePage />
	return (
		<div className="App h-dvh w-dvw flex flex-col">
			<NavBar></NavBar>
			<div className="flex flex-col mainContent bg-blue flex-1 border-x-2 border-b-5 rounded-b-2xl border-black justify-center items-center">
				<Routes>
					<Route path="/login" element={loginElement} />
					<Route path="/register" element={registerElement} />
					<Route path="/editProfile" element={editProfileElement} />
					<Route path="/users/:username" element={profileElement} />
					<Route path="/" element={<HomePage />} />
					<Route path="*" element={<Navigate to="/" replace />} />
					<Route path="/dle" element={dleElement} />
				</Routes>
			</div>
		</div>
	)
}

export default App

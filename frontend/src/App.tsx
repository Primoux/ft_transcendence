import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { Routes, Route, Navigate } from 'react-router';
import HomePage from './pages/HomePage'
import NavBar from './components/NavBar'
import ProfilePage from './pages/ProfilePage'
import DlePage from './pages/DlePage'
import EditProfilePage from './pages/EditProfilePage';
import { useAuth } from './useAuth';
import Spinner from './components/Spinner';
import VerifyEmailPage from './pages/VerifyEmailPage'
import TwoFactorLoginPage from './pages/TwoFactorLoginPage'
import { Toaster } from 'sonner';

function App() {
	const auth = useAuth()


	if (auth.authState.authStatus === "loading") {
		return (<Spinner size="lg" />)
	}

	let loginElement, registerElement, profileElement, editProfileElement, dleElement, verifyEmailElement, verify2faElement, homeElement;
	if (auth.authState.authStatus == "logged-in" && auth.authState.user.emailVerifiedAt !== null) {
		loginElement = <Navigate to="/" replace />
		registerElement = <Navigate to="/" replace />
		profileElement = <ProfilePage />
		homeElement = <HomePage />
		editProfileElement= <EditProfilePage user={auth.authState.user} />
		dleElement = <DlePage />
		verifyEmailElement = <Navigate to="/" replace />
		verify2faElement= <Navigate to="/" replace />
	} else if (auth.authState.authStatus === "logged-in") {
		verifyEmailElement = <VerifyEmailPage />
		loginElement = <Navigate to="/verify-email" replace />
		registerElement = <Navigate to="/verify-email" replace />
		profileElement = <Navigate to="/verify-email" replace />
		editProfileElement= <Navigate to="/verify-email" replace />
		dleElement = <Navigate to="/verify-email" replace />
		homeElement = <Navigate to="/verify-email" replace />
		verify2faElement= <Navigate to="/" replace />
	}
	else {
		homeElement = <Navigate to="/login" replace />
		loginElement = <LoginPage/>
		registerElement = <RegisterPage/>
		profileElement = <Navigate to="/login" replace />
		editProfileElement= <Navigate to="/login" replace />
		dleElement = <Navigate to="/login" replace />
		verifyEmailElement = <Navigate to="/login" replace />
		verify2faElement = <TwoFactorLoginPage />
	}
	return (
		<div className="App min-h-dvh w-full flex flex-col">
			<Toaster position="bottom-right" />
			<NavBar></NavBar>
			<div className="flex flex-col flex-1 justify-center items-center p-4">
				<Routes>
					<Route path="/login" element={loginElement} />
					<Route path="/register" element={registerElement} />
					<Route path="/editProfile" element={editProfileElement} />
					<Route path="/verify-email" element={verifyEmailElement} />
					<Route path="/2fa/verify" element={verify2faElement} />
					<Route path="/users/:username" element={profileElement} />
					<Route path="/" element={homeElement} />
					<Route path="*" element={<Navigate to="/" replace/>} />
					<Route path="/dle" element={dleElement} />
				</Routes>
			</div>
		</div>
	)
}

export default App

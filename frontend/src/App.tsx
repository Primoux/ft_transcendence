import LoginForm from './components/auth/LoginForm'
import './styles/theme.css'
import RegisterForm from './components/auth/RegisterForm'
import { useState, useEffect } from "react"
import type { User } from './types/user'
import { Routes, Route, useNavigate, Navigate } from 'react-router';
import HomePage from './pages/HomePage'
import NavBar from './components/NavBar'
import ProfilePage from './pages/ProfilePage'

function App() {
	const goTo = useNavigate();
	const [currentUser, setCurrentUser] = useState<User | null>(null)
	const [isLoading, setLoading] = useState<boolean>(true)
	function connectUser(user: User) {
		setCurrentUser(user)
		goTo("/", {replace: true})
	}

	function disconnectUser() {
		setCurrentUser(null)
	}

	useEffect( () => {
		async function loadUser() {
			try {
				const response = await fetch("/api/users/me")
				if (response.ok) {
					const user : User = await response.json()
					setCurrentUser(user)
				}
			}
			catch (error){
				// backend error : not logging in
			}
			finally {
				setLoading(false)
			}
		}
		loadUser()
	}, [])

	if (isLoading) {
		return (<p>loading</p>)
	}

	let loginElement, registerElement, profileElement;
	if (currentUser) {
		loginElement = <Navigate to="/" replace />
		registerElement = <Navigate to="/" replace />
		profileElement = <ProfilePage />
	} else {
		loginElement = <LoginForm onLogin={connectUser} />
		registerElement = <RegisterForm onLogin={connectUser} />
		profileElement = <Navigate to="/login" replace />
	}
	return (
		<>
		<div className="App h-dvh w-dvw flex flex-col">
			<NavBar user={currentUser} logout={disconnectUser} />
			<div className="flex flex-col mainContent bg-blue flex-1 border-x-2 border-b-5 rounded-b-2xl border-black justify-center items-center">
				<Routes>
					<Route path="/login" element={loginElement} />
					<Route path="/register" element={registerElement} />
					<Route path="/users/:username" element={profileElement} />
					<Route path="/" element={<HomePage />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</div>
		</div>
		</>
	)
}

export default App

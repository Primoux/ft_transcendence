import LoginForm from './LoginForm'
import './App.css'
import RegisterForm from './RegisterForm'
import { useState, useEffect } from "react"
import type { User } from './types/user'
import { Routes, Route, useNavigate, Navigate } from 'react-router';
import HomePage from './HomePage'
import NavBar from './NavBar'
import ProfilePage from './ProfilePage'

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

	let rootElement, loginElement, registerElement, profileElement;
	if (currentUser) {
		rootElement = <HomePage />
		loginElement = <Navigate to="/" replace />
		registerElement = <Navigate to="/" replace />
		profileElement = <ProfilePage />
	} else {
		rootElement = <Navigate to="/login" replace />
		loginElement = <LoginForm onLogin={connectUser} />
		registerElement = <RegisterForm onLogin={connectUser} />
		profileElement = <Navigate to="/login" replace />
	}
	return (
		<>
		<div className="App h-dvh w-dvw flex flex-col">
			<NavBar user={currentUser || {id: 0, username: "", displayName: "", registerDate: new Date()}} logout={disconnectUser}></NavBar>
			<div className="flex flex-col mainContent bg-blue flex-1 border-x-2 border-b-5 rounded-b-2xl border-black justify-center items-center">
				<Routes>
					<Route path="/login" element={loginElement} />
					<Route path="/register" element={registerElement} />
					<Route path="/users/:username" element={profileElement} />
					<Route path="/" element={rootElement} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</div>
		</div>
		</>
	)
}

export default App

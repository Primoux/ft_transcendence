import LoginForm from './LoginForm'
import './App.css'
import RegisterForm from './RegisterForm'
import { useState, useEffect } from "react"
import type { User } from './types/user'
import { Routes, Route, useNavigate, Navigate } from 'react-router';
import HomePage from './HomePage'
import DlePage from './DlePage'
import NavBar from './NavBar'

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
		async function loadProfile() {
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
		loadProfile()
	}, [])

	if (isLoading) {
		return (<p>loading</p>)
	}

	let rootElement, loginElement, registerElement;
	if (currentUser) {
		rootElement = <HomePage />
		loginElement = <Navigate to="/" replace />
		registerElement = <Navigate to="/" replace />
	} else {
		rootElement = <Navigate to="/login" replace />
		loginElement = <LoginForm onLogin={connectUser} />
		registerElement = <RegisterForm onLogin={connectUser} />
	}
	let dleElement;
	dleElement = <DlePage />
	return (
		<>
		<div className="App h-dvh w-dvw flex flex-col">
			<NavBar user={currentUser || {id: 0, username: "", displayName: ""}} logout={disconnectUser}></NavBar>
			<div className="flex flex-col mainContent bg-blue flex-1 border-x-2 border-b-2 rounded-b-2xl border-black">
				<Routes>
					<Route path="/login" element={loginElement} />
					<Route path="/register" element={registerElement} />
					<Route path="/" element={rootElement} />
					<Route path="*" element={<Navigate to="/" replace />} />
					<Route path="/dle" element={dleElement} />
				</Routes>
			</div>
		</div>
		</>
	)
}

export default App

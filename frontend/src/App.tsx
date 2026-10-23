import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { useState, useEffect } from "react"
import type { User } from './types/user'
import { Routes, Route, useNavigate, Navigate } from 'react-router';
import HomePage from './pages/HomePage'
import NavBar from './components/NavBar'
import ProfilePage from './pages/ProfilePage'
import DlePage from './pages/DlePage'

function App() {
	const goTo = useNavigate();
	const [currentUser, setCurrentUser] = useState<User | null>(null)
	const [isLoading, setLoading] = useState<boolean>(true)
	function connectUser(user: User) {
		setCurrentUser(user)
		goTo("/", {replace: true})
	}

	async function disconnectUser() {
		try {
			const response = await fetch("/api/auth/logout", {
				method: "POST"
			})
			if (!response.ok) {
				console.error("logout failed :(")
				return
			}
		} catch (error) {
			console.error(error)
			return
		}
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
		profileElement = <ProfilePage currentUser={currentUser}/>
	} else {
		loginElement = <LoginPage onLogin={connectUser} />
		registerElement = <RegisterPage onLogin={connectUser} />
		profileElement = <Navigate to="/login" replace />
	}
	let dleElement;
	dleElement = <DlePage />
	return (
		<div className="App min-h-dvh w-full flex flex-col">
			<NavBar user={currentUser} logout={disconnectUser}></NavBar>
			<div className="flex flex-col flex-1 justify-center items-center p-4">
				<Routes>
					<Route path="/login" element={loginElement} />
					<Route path="/register" element={registerElement} />
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

import LoginForm from './LoginForm'
import './App.css'
import RegisterForm from './RegisterForm'
import { useState, useEffect } from "react"
import type { User } from './types/user'


function App() {
	const [currentUser, setCurrentUser] = useState<User | null>(null)
	const [isLoading, setLoading] = useState<boolean>(true)
	function connectUser(user: User) {
		setCurrentUser(user)
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
	return (
		<>
		<div className="App">
			{currentUser ? <p> welcome {currentUser.username} aka {currentUser.displayName}</p> : <> <LoginForm onLogin={connectUser} /> <RegisterForm onLogin={connectUser} /> </>}
		</div>
		</>
	)
}

export default App

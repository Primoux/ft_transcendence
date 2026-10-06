import LoginForm from './LoginForm'
import './App.css'
import RegisterForm from './RegisterForm'


function App() {
  return (
    <>
		<div className="App">
		<h1>Welcome to the App</h1>
		<h2>Login Form</h2>
		<br />
		<LoginForm />
		<h2>Register Form</h2>
    	<RegisterForm />
    	<br />
		</div>
    </>
  )
}

export default App

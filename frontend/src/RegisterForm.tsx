import { useState} from "react"

export default function RegisterForm() {
	const [username, setUsername] = useState('');
	const [displayname, setDisplayName] = useState('');
	const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)


    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
		console.log("registering user : " + username + "\n display name: " + displayname)
        e.preventDefault()
        setErrorMsg(null)
        setLoading(true)
        try{
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username: username, password: password, displayName: displayname}),
            })
            if (!response.ok) {
				const data = await response.json()
				setErrorMsg(data.error)
			}
        }
        catch (err) {
			console.error(err)
            setErrorMsg ("Could not reach the server")
        } finally {
            setLoading(false)
        }
    }

	return (
		<form onSubmit={handleSubmit}>
			<label>
				username
				<input
					name="username"
					placeholder="username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>
			</label>
			<label>
				display name
				<input
					name="displayname"
					placeholder="display name"
					value={displayname}
					onChange={(e) => setDisplayName(e.target.value)}
				/>
			</label>
			<label>
				password
				<input
					type="password"
					name="password"
					placeholder="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
			</label>

			<button disabled={loading} type="submit">Register</button>
            {errorMsg && <p> {errorMsg} </p>}

		</form>
	);
}

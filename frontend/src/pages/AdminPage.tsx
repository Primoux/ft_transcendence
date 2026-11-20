import { useEffect, useState } from "react"
import type { User } from "../types/user"

function AdminPage() {
    const [users, setUsers] = useState<User[]>([])
    const [error, setError] = useState(false)

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await fetch("/api/admin/users")
                if (!response.ok) {
                    setError(true)
                    return
                }
                setUsers(await response.json())
            }
            catch (err) {
                console.error(err)
                setError(true)
            }
        }
        fetchUsers()
    }, [])

    return (
        <div className="flex flex-col gap-4 w-full max-w-3xl">
            <h1 className="card font-beleren text-3xl">Admin</h1>

            {error && <p>Error while loading users.</p>}

            <table className="table">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Joined</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.username}</td>
                            <td>{user.role}</td>
                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default AdminPage

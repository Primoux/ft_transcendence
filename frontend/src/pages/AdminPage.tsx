import { useEffect, useState } from "react"
import type { Role, User } from "../types/user"
import { useAuth } from "../useAuth"

function AdminPage() {
    const me = useAuth().authState.user
    // same rules as the backend: moderators can't change roles,
    // and only the owner can promote to admin or demote an admin
    const canChangeRoles = me?.role === "ADMIN" || me?.role === "OWNER"
    const canManageAdmins = me?.role === "OWNER"

    function canEditRole(user: User) {
        if (!canChangeRoles) return false
        if (user.role === "OWNER") return false
        if (user.id === me?.id) return false
        if (user.role === "ADMIN" && !canManageAdmins) return false
        return true
    }
    const [users, setUsers] = useState<User[]>([])
    const [error, setError] = useState(false)
    const [roleError, setRoleError] = useState(false)

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

    async function changeRole(userId: string, role: Role) {
        setRoleError(false)
        try {
            const response = await fetch(`/api/admin/users/${userId}/role`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role }),
            })
            if (!response.ok) {
                setRoleError(true)
                return
            }
            const updated: User = await response.json()
            // replace only the changed user, keep the others as they are
            setUsers(users.map((user) => user.id === updated.id ? updated : user))
        }
        catch (err) {
            console.error(err)
            setRoleError(true)
        }
    }

    return (
        <div className="flex flex-col gap-4 w-full max-w-3xl">
            <h1 className="card font-beleren text-3xl">Admin</h1>

            {error && <p>Error while loading users.</p>}
            {roleError && <p>Couldn't change the role.</p>}

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
                            <td>
                                {!canEditRole(user) ? user.role : (
                                    <select
                                        className="select select-sm"
                                        value={user.role}
                                        onChange={(e) => changeRole(user.id, e.target.value as Role)}
                                    >
                                        <option value="USER">USER</option>
                                        <option value="MODERATOR">MODERATOR</option>
                                        {canManageAdmins && <option value="ADMIN">ADMIN</option>}
                                    </select>
                                )}
                            </td>
                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default AdminPage

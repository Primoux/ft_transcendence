import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User } from "./types/user";
type AuthProviderProps = {
    children: React.ReactNode
}

type LoggedIn = {
    user: User
    authStatus: "logged-in"
}

type LoggedOut = {
    user: null
    authStatus: "logged-out" | "loading" | "error"
}

type AuthSuccess = {
    user: User
    error : null
}

type AuthFail = {
    user: null
    error : string
}

type LoginData = {
    username: string
    password: string
}

type RegisterData = {
    username: string
    displayName: string
    password: string
    passwordConfirmation: string
}

type AuthContextValueType = {
    authState : LoggedIn | LoggedOut
    login: (loginData: LoginData) => (Promise<AuthSuccess | AuthFail>)
    register: (registerData: RegisterData) => (Promise<AuthSuccess | AuthFail>)
    refreshUser: () => (Promise<void>)
    logout: () => (Promise<void>)
}

const AuthContext = createContext<AuthContextValueType | null>(null)

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === null)
        throw new Error("use of useAuth with no auth context")

        return (context)
    }

export function AuthProvider({children} : AuthProviderProps) {
    const [authState, setAuthState] = useState<LoggedIn | LoggedOut>({user: null, authStatus: "loading"})

    
    async function register({username, displayName, password, passwordConfirmation}: RegisterData): Promise<AuthSuccess | AuthFail>{
        try{
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username, displayName, password, passwordConfirmation}),
            })
			const data = await response.json()
            if (!response.ok) {
                return ({user:null, error: data.error})
			}
			else {
                setAuthState({user: data, authStatus: "logged-in"})
                return ({user: data, error: null})
            }
        }
        catch (err) {
            return ({user: null, error: "fetch failed"})
        }
    }

    const refreshUser = useCallback(async () => {
        try {
            const response = await fetch("/api/users/me")
            if (response.ok) {
                const userToLog : User = await response.json()
                setAuthState({user: userToLog, authStatus: "logged-in"})
            }
            else {
                if (response.status === 401)
                    setAuthState({user: null, authStatus: "logged-out"})
                else
                    setAuthState({user: null, authStatus: "error"})
            }
        }
        catch (error){
            console.error("Auth failed")
            setAuthState({user: null, authStatus: "error"})
        }
    }, [])

    async function logout() {
        try {
            const response = await fetch("/api/auth/logout",{ method : "POST" })
            if (response.ok || response.status === 401) {setAuthState({user: null, authStatus: "logged-out"})}
            else { console.error("logout failed")}
        } catch (error ) {
            console.error(error)
        }
    }

    async function login({username, password} : LoginData): Promise<AuthSuccess | AuthFail> {
        try{
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username: username, password: password}),
            })
            const body = await response.json()
            if (!response.ok) {return {user: null, error: body.error}}
            else {
                setAuthState({user: body, authStatus: "logged-in"})
                return {user: body, error: null}
            }
        }
        catch (err) {
            return ({user: null, error: "fetch failed"})
        }
    }

    useEffect(() => {
        refreshUser()
	}, [refreshUser])

    return (
        <AuthContext value={{authState, login, logout, register, refreshUser}}>
            {children}
        </AuthContext>
    )
}
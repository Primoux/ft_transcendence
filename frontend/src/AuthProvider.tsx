import { useCallback, useEffect, useState } from "react";
import type { User } from "./types/user";
import type { AuthProviderProps, LoggedIn, LoggedOut, RegisterData, LoginData, AuthSuccess, AuthFail } from './AuthContext'

import { AuthContext } from './AuthContext'



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
        catch (error) {
            console.error(error)
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
            console.error(error)
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
        catch (error) {
            console.error(error)
            return ({user: null, error: "fetch failed"})
        }
    }

    useEffect(() => {
        /*in refreshUser, every call to stateSetters are made *after* an async `fetch()` call, which does not trigger cascading renders like a synchronous call would. */

        /* eslint-disable-next-line */
        refreshUser()
	}, [refreshUser])

    return (
        <AuthContext value={{authState, login, logout, register, refreshUser}}>
            {children}
        </AuthContext>
    )
}
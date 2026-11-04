import { createContext } from "react"
import type { User } from './types/user' 

export type AuthProviderProps = {
    children: React.ReactNode
}

export type LoggedIn = {
    user: User
    authStatus: "logged-in"
}

export type LoggedOut = {
    user: null
    authStatus: "logged-out" | "loading" | "error"
}

export type AuthSuccess = {
    user: User
    error : null
}

export type AuthFail = {
    user: null
    error : string
}

export type LoginData = {
    username: string
    password: string
}

export type RegisterData = {
    username: string
    displayName: string
    password: string
    passwordConfirmation: string
}

export type AuthContextValueType = {
    authState : LoggedIn | LoggedOut
    login: (loginData: LoginData) => (Promise<AuthSuccess | AuthFail>)
    register: (registerData: RegisterData) => (Promise<AuthSuccess | AuthFail>)
    refreshUser: () => (Promise<void>)
    logout: () => (Promise<void>)
}

export const AuthContext = createContext<AuthContextValueType | null>(null)
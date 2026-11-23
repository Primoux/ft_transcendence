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
    status: "success"
}

export type AuthPending = {
    status: "2fa-required"
}

export type AuthFail = {
    error : string
    status: "error"
}

export type LoginData = {
    username: string
    password: string
}

export type RegisterData = {
    username: string
    email:    string
    password: string
    passwordConfirmation: string
}

export type AuthContextValueType = {
    authState : LoggedIn | LoggedOut
    login: (loginData: LoginData) => (Promise<AuthSuccess | AuthPending | AuthFail>)
    verifyLogin: (code: string) => (Promise<AuthSuccess | AuthFail>)
    register: (registerData: RegisterData) => (Promise<AuthSuccess | AuthFail>)
    refreshUser: () => (Promise<void>)
    logout: () => (Promise<void>)
}

export const AuthContext = createContext<AuthContextValueType | null>(null)
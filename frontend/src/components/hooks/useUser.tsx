import { useEffect, useState} from "react"
import type { User } from "../../types/user"

type userStatsResponse = {
    wonSessionsCount: number
    avgGuessCount : number | null
}

type userStatsLoading = {
    status: "loading"
}
type userStatsError = {
    status: "error"
}
type userStatsPrivate = {
    status: "private"
}

type userStatsLoaded = {
    status: "loaded"
    wonSessionsCount: number
    avgGuessCount: number | null
}

type userStatsState = {
    username: string
    userStats: userStatsLoaded |  userStatsError | userStatsPrivate
}

export function useUserStats(username: string | undefined) : userStatsLoaded | userStatsLoading | userStatsError | userStatsPrivate{
    const [userStats, setUserStats] = useState<userStatsState | null>(null)

    useEffect ( () => {
            const abortController = new AbortController()
            async function fetchUserStats(username: string) {
                try {
                    const response = await fetch(`/api/users/${encodeURIComponent(username)}/stats`, {signal: abortController.signal})
                    if (!response.ok) {
                        if (response.status === 403)
                            setUserStats({username, userStats: {status: "private"}})
                        else
                            setUserStats({username, userStats: {status: "error"}})
                    }
                    else {
                        const userConst : userStatsResponse = await response.json();
                        setUserStats({username, userStats: {wonSessionsCount: userConst.wonSessionsCount, avgGuessCount: userConst.avgGuessCount, status: "loaded"}})
                    }
                }
                catch (error) {
                    console.error(error)
                    if (!abortController.signal.aborted)
                        setUserStats({username, userStats: {status: "error"}})
                }
            }

            if (username === undefined)
                return
            else
                fetchUserStats(username)
            return (() => abortController.abort("stale content"))
        }, [username])

        if (username === undefined)
            return ({status: "error"})
        if (userStats === null || username !== userStats.username)
            return ({status: "loading"})
        return (userStats.userStats)
}

type UserLoaded = {
    user : User 
    status: "loaded" 
}

type UserNotFound = {
    status: "notFound"
}

type UserError = {
    status: "error"
}

type UserLoading = {
    status: "loading"
}

type UserState = {
    username: string
    result : UserLoaded | UserError | UserNotFound
}

export function useUser(username: string | undefined) : UserError | UserNotFound | UserLoading | UserLoaded {
    const [userState, setUserState] = useState<UserState | null>(null)
    useEffect ( () => {
            const abortController = new AbortController()
            async function fetchUser(username: string) {
                try {
                    const response = await fetch(`/api/users/${encodeURIComponent(username)}`, {signal: abortController.signal})
                    if (!response.ok) {
                        if (response.status === 404)
                            setUserState({username, result: {status: "notFound"}})
                        else
                            setUserState({username, result: {status: "error"}})
                    }
                    else {
                        const userConst : User = await response.json();
                        setUserState({username: username, result:{user: userConst, status: "loaded"}})
                    }
                }
                catch (error) {
                    if (!abortController.signal.aborted)
                        setUserState({username, result: {status: "error"}})
                    console.error(error)
                }
            }

            if (username === undefined)
                return
            else
                fetchUser(username)
            return (() => abortController.abort("stale content"))
        }, [username])

        if (username === undefined)
            return ({status: "error"})
        if (userState === null || username !== userState.username)
            return ({status: "loading"})
        return (userState.result)
}
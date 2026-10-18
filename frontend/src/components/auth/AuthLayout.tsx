import type { ReactNode } from 'react'
import { Link } from 'react-router'

type AuthLayoutProps = {
    title: string
    subtitle: ReactNode
    onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void
    children: ReactNode
}

function AuthLayout({ title, subtitle, onSubmit, children } : AuthLayoutProps) {
    return (
        <div className="w-full max-w-sm bg-white p-6">
            <header className="flex items-center justify-between">
                <span className="font-bold">MtgDle</span>
                <Link to="/" className="underline">Back to home</Link>
            </header>

            <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <p>{subtitle}</p>
                </div>
                {children}
            </form>
        </div>
    )
}

export default AuthLayout

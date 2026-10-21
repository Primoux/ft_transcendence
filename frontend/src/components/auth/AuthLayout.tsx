import type { ReactNode } from 'react'
import { Link } from 'react-router'
// import authImage from '../../assets/images.webp' #for now i use a place holder image


type AuthLayoutProps = {
    title: string
    subtitle: ReactNode
    onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void
    children: ReactNode
}

function AuthLayout({ title, subtitle, onSubmit, children } : AuthLayoutProps) {
    return (
		<div className="card bg-base-100 shadow-xl w-full max-w-4xl overflow-hidden grid md:grid-cols-2 md:min-h-[36rem]">
			<div className="p-6 flex flex-col">
				<header className="flex items-center justify-between">
					<span className="font-bold">MtgDle</span>
					<Link to="/" className="btn">Back to home</Link>
				</header>

				<form onSubmit={onSubmit} className="mt-6 flex flex-1 flex-col justify-center gap-4">
					<div>
						<h1 className="text-2xl font-bold">{title}</h1>
						<p>{subtitle}</p>
					</div>
					{children}
				</form>
			</div>
			<img src="https://placehold.co/448x576" alt="" className="hidden md:block h-full w-full object-cover" />
		</div>
    )
}

export default AuthLayout

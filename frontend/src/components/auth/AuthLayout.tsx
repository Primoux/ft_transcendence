import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
// import authImage from '../../assets/images.webp' #for now i use a place holder image

type AuthLayoutProps = {
    title: string
    subtitle: ReactNode
    onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void
    children: ReactNode
}

const img1 = "https://cards.scryfall.io/normal/front/d/7/d7f35cd9-71ac-4191-8604-1a653b56c42d.jpg?1783904885"
const img2 = "https://cards.scryfall.io/normal/back/d/7/d7f35cd9-71ac-4191-8604-1a653b56c42d.jpg?1783904885"

function AuthLayout({ title, subtitle, onSubmit, children }: AuthLayoutProps) {
    const [flipped, setFlipped] = useState(false)

    return (
        <div className="card bg-base-100 shadow-xl w-full max-w-4xl grid md:grid-cols-2 md:min-h-[43rem]">
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
            <div className="hover-3d justify-center" onClick={() => setFlipped(!flipped)}>
                {/* content */}
                <figure className="rounded-2xl">
                    <img
                        src={flipped ? img2 : img1}
                        alt="3D card"
                        className="rounded-3xl"
                    />
                </figure>
                {/* 8 empty divs needed for the 3D effect */}
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    )
}

export default AuthLayout

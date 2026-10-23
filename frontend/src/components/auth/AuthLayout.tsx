import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import Card3D from '../Card3D'
// import authImage from '../../assets/images.webp' #for now i use a place holder image

type AuthLayoutProps = {
    title: string
    subtitle: ReactNode
    onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void
    children: ReactNode
}

// To remove after the card db
const cardFront = "https://cards.scryfall.io/normal/front/e/c/ec191a2f-12b1-438b-b2fe-f88fb82d9b87.jpg?1783905392"
const cardBack = "https://tolkiengateway.net/w/images/thumb/1/18/Magic_the_Gathering_Card_Back.jpg/640px-Magic_the_Gathering_Card_Back.jpg"


function AuthLayout({ title, subtitle, onSubmit, children }: AuthLayoutProps) {
    return (
        <div className="card bg-base-100 shadow-xl w-full max-w-4xl grid md:grid-cols-[3fr_2fr] md:min-h-[43rem]">
            <div className="p-6 md:p-8 flex flex-col justify-center gap-4">
                <div>
                    <Link to="/" className="btn btn-ghost btn-sm w-fit -ml-2 mb-2 gap-1">
                        <ArrowLeft className="h-[1em]" />
                        Back
                    </Link>
                    <h1 className="font-beleren-sc text-2xl font-bold">{title}</h1>
                    <p className="font-matrix">{subtitle}</p>
                </div>
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    {children}
                </form>
            </div>
            <div className="hidden md:flex items-center justify-center p-6">
                <Card3D front={cardFront} back={cardBack} />
            </div>
        </div>
    )
}

export default AuthLayout

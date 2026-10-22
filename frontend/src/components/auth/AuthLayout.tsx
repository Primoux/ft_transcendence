import type { ReactNode } from 'react'
import { Link } from 'react-router'
import Card3D from '../Card3D'
// import authImage from '../../assets/images.webp' #for now i use a place holder image

type AuthLayoutProps = {
    title: string
    subtitle: ReactNode
    onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void
    children: ReactNode
}

const img1 = "https://cards.scryfall.io/normal/front/e/c/ec191a2f-12b1-438b-b2fe-f88fb82d9b87.jpg?1783905392"
const img2 = "https://tolkiengateway.net/w/images/thumb/1/18/Magic_the_Gathering_Card_Back.jpg/640px-Magic_the_Gathering_Card_Back.jpg"


function AuthLayout({ title, subtitle, onSubmit, children }: AuthLayoutProps) {
    return (
        <div className="card bg-base-100 shadow-xl w-full max-w-4xl grid md:grid-cols-2 md:min-h-[43rem]">
            <div className="p-6 flex flex-col">
				<button className="btn btn-ghost w-fit mb-4">
					<Link to="/">Back</Link>
				</button>
                <form onSubmit={onSubmit} className="mt-6 flex flex-1 flex-col justify-center gap-4">
                    <div>
                        <h1 className="font-beleren-sc text-2xl font-bold">{title}</h1>
                        <p className="font-matrix">{subtitle}</p>
                    </div>
                    {children}
                </form>
            </div>
			<div className="flex items-center justify-center p-6">
            	<Card3D front={img1} back={img2} />
			</div>
        </div>
    )
}

export default AuthLayout

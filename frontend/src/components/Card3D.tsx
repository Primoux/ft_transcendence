import { useState } from "react"

type Card3DProps = {
    front: string
    back: string
}

const faceClass = "h-full w-full object-cover rounded-2xl"

function Card3D({ front, back }: Card3DProps) {
    const [flipped, setFlipped] = useState(false)

    return (
        <div className="flex flex-col items-center gap-4">
            <button
                type="button"
                aria-label={flipped ? "Show the front of the card" : "Show the back of the card"}
                className="hover-3d w-full cursor-pointer"
                onClick={() => setFlipped(!flipped)}
            >
                <figure className="rounded-2xl">
                    <div className={`swap swap-flip w-full aspect-[63/88] [perspective:100rem] ${flipped ? "swap-active" : ""}`}>
                        <img src={back} alt="Back of the card" className={`swap-on ${faceClass}`} />
                        <img src={front} alt="Front of the card" className={`swap-off ${faceClass}`} />
                    </div>
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
            </button>
            <p className="font-matrix text-sm opacity-60 mb-2">Click the card to flip it</p>
        </div>
    )
}

export default Card3D

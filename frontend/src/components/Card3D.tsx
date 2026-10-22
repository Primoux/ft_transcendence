import { useState } from "react"

type Card3DProps = {
    front: string
    back: string
}

const faceClass = "w-full aspect-[488/680] object-cover rounded-2xl"

function Card3D({ front, back }: Card3DProps) {
    const [flipped, setFlipped] = useState(false)

    return (
        <div className="hover-3d cursor-pointer" onClick={() => setFlipped(!flipped)}>
            <figure className="rounded-2xl">
                <div className={`swap swap-flip [perspective:100rem] ${flipped ? "swap-active" : ""}`}>
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
        </div>
    )
}

export default Card3D

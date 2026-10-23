import DlePreview from "../components/DlePreview"
import type { Dle } from "../types/dle"

const dles: Dle[] = [ // Mock data for Dle games
    { id: "magic-dle", name: "MagicDle", players: 2, status: "not started", link: "/dle" },
    // { id: "magic-image", name: "MagicImage", players: 3, status: "in progress", link: "/dle" },
    // { id: "magic-quote", name: "MagicQuote", players: 30, status: "completed", link: "/dle" },
]

function HomePage() {
    return (
        <div className="pt-12 grid place-items-center rounded-sm">
            <h1 className="font-beleren-sc text-4xl">MtgDle</h1>
            <section className="shadow-lg p-10 bg-base-200 rounded-sm">
                <h2 className="m-4 text-3xl">Today Dle games :</h2>
                <ul className="flex flex-row flex-wrap justify-center gap-4">
                    {dles.map((dle) => (
                        <li key={dle.id}>
                            <DlePreview {...dle} />
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    )
}


export default HomePage

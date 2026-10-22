import DlePreview from "../components/DlePreview"
import type { Dle } from "../types/dle"

const dles: Dle[] = [
    { name: "MagicDle", players: 2, status: "not started" },
    { name: "MagicImage", players: 3, status: "in progress" },
    { name: "MagicQuote", players: 30, status: "completed" },
]

function HomePage() {
    return (
        <div className="pt-12 grid place-items-center rounded-sm">
            <h1 className="text-6xl">MtgDle</h1>
            <h2 className="m-4 text-3xl">Today Dle games :</h2>
            <section className="border-1 p-10 bg-base-200 rounded-sm">
                <ul className="flex flex-row flex-wrap justify-center gap-4">
                    {dles.map((dle) => (
                        <li key={dle.name}>
                            <DlePreview name={dle.name} players={dle.players} status={dle.status} />
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    )
}


export default HomePage

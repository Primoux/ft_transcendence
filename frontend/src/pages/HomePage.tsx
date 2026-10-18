import DlePreview from "../components/DlePreview"

function HomePage() {
    return (
        <div className="pt-12 grid place-items-center rounded-sm">
            <h1 className="text-6xl">MtgDle</h1>
            <h2 className="m-4 text-3xl">Today Dle games :</h2>
            <section className="flex flex-row flex-wrap list border-1 justify-center p-10 bg-white rounded-sm">
                <DlePreview></DlePreview>
                <DlePreview></DlePreview>
                <DlePreview></DlePreview>
            </section>
        </div>
    )
}


export default HomePage

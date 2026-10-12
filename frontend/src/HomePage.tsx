import DlePreview from "./DlePreview"

function HomePage() {
    return (
        <div className="pt-12 grid place-items-center rounded-sm">
            <h1>HubDle</h1>
            <h2>Today Dle games :</h2>
            <section className="flex flex-row flex-wrap list border-1 justify-evenly p-10">
                <DlePreview></DlePreview>
                <DlePreview></DlePreview>
                <DlePreview></DlePreview>
            </section>
        </div>
    )
}


export default HomePage
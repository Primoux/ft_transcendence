import { Link } from 'react-router'
import type { Dle } from '../types/dle'

const statusColor: Record<Dle["status"], string> = {
    "not started": "bg-info text-info-content",
    "in progress": "bg-warning text-warning-content",
    "completed": "bg-success text-success-content",
}

function DlePreview({ name, players, status, link } : Dle) {
    return (
        <Link to={link} className={`card shadow-xl ${statusColor[status]}`}>
            <article>
                <h3>{name}</h3>
                <p>Players: {players}</p>
                <p>Status: {status}</p>
            </article>
        </Link>
    )
}

export default DlePreview

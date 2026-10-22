import { Link } from 'react-router/internal/react-server-client'
import type { Dle } from '../types/dle'

const statusColor = {
    "not started": "bg-info text-info-content",
    "in progress": "bg-warning text-warning-content",
    "completed": "bg-success text-success-content",
}

function DlePreview({ name, players, status, link } : Dle) {
    return (
            <p><Link to={link}>
				<article className={`card shadow-xl ${statusColor[status]}`}>
	        	<h3>{name}</h3>
            	<p>Players: {players}</p>
            	<p>Status: {status}</p>
      			</article>
			</Link></p>
    )
}

export default DlePreview

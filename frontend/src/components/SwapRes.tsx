import {useState, useEffect} from "react";

function SwapRes({onMsg="Front", offMsg="Back", delay=400}) {
	const [flipped, setFlipped] = useState(false);
	
	useEffect(() => {
		const timeout = setTimeout(() => {
			setFlipped(true);
		}, delay);
		return () => clearTimeout(timeout);
	}, [delay]);

  return (
    <label className="swap swap-flip text-6xl">
			<input type="checkbox" checked={flipped} readOnly />
			<div className="swap-on">{onMsg}</div>
			<div className="swap-off">{offMsg}</div>
		</label>
  );
}

export default SwapRes;
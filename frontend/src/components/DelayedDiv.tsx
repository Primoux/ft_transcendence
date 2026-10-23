import {useState, useEffect} from "react";

function DelayedDiv({delay=1000, children} : {delay?: number, children: React.ReactNode}) {
	const [visible, setVisible] = useState(false);
	
	useEffect(() => {
		const timeout = setTimeout(() => {
			setVisible(true);
		}, delay);
		return () => clearTimeout(timeout);
	}, [delay]);

  return (
    <div style={{ visibility: visible ? "visible" : "hidden" }}>
			{children}
		</div>
  );
}

export default DelayedDiv;
import React from "react";

export default function useSemiPersistentState(key,defaultValue) {
	let storedValue = localStorage.getItem(key) && JSON.parse(localStorage.getItem(key));
	const [state, setState] = 
		React.useState(storedValue || defaultValue);

	React.useEffect(() => {
		localStorage.setItem(key, JSON.stringify(state))
	}, [state]);

	return [state, setState];
}
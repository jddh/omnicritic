import React from "react";

export default function SearchField({setSearchQuery}) {
	const inputTimer = React.useRef(null);

	function handleSearch(event) {
		const term = event.target.value;

		clearTimeout(inputTimer.current);
		inputTimer.current = setInterval(() => {
			clearTimeout(inputTimer.current);
			setSearchQuery(term);
		},500)
	}

	return (
		<input type="text" id="title-search" placeholder="Search" onChange={handleSearch} />
	)
}
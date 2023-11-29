import React from "react";

export default function SearchField({setSearchQuery}) {
	const inputTimer = React.useRef(null);

	function handleSearch(event) {
		const term = event.target.value;

		clearTimeout(inputTimer.current);
		inputTimer.current = setInterval(() => {
			clearTimeout(inputTimer.current);
			if (term.length > 2)
				setSearchQuery(term);
			else if (!term) setSearchQuery('');
		},500)

	}

	function handleSubmit(event) {
		event.preventDefault();
		const q = event.target['title-search'].value;
		window.location.pathname = '/search/' + q;
	}

	return (
		<form onSubmit={handleSubmit}>
			<input type="text" name="title-search" id="title-search" placeholder="Search Everything" onChange={handleSearch} />
		</form>
	)
}
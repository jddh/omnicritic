import React from "react";
import useSemiPersistentState from "./semiPersistentState";

export default function FilterButtons({ filter, filterHandler }) {

	const filterStrings = [
		['all', 'All'],
		['rated', 'Rated'],
		['unrated', 'Unrated'],
		['nullrated', 'Nullrated']
	];

	function handleClick(e) {
		// setFilter(e.target.value);
		filterHandler(e);
	}

	return (
		<div className="filter-buttons">
			{filterStrings.map(([key, label]) =>
				<button
					key={key}
					value={key}
					id={'filter-' + key}
					disabled={key == filter}
					onClick={handleClick}>
					{label}
				</button>
			)}
		</div>
	)
}
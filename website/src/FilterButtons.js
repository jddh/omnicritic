import React from "react";
import useSemiPersistentState from "./semiPersistentState";

export default function FilterButtons({filter, filterHandler}) {
	
	const filterStrings = ['all','rated','unrated'];

	function handleClick(e) {
		// setFilter(e.target.value);
		filterHandler(e);
	}

	return (
		<div className="filter-buttons">
			{filterStrings.map(fs => 
				<button 
					key={fs}
					value={fs}
					id={'filter-' + fs}
					disabled={fs == filter}
					onClick={handleClick}>
						{fs}
				</button>	
			)}
		</div>
	)
}
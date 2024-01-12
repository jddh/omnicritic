import React from "react";

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
			<h2>
				<span className="select"><select value={filter} onChange={handleClick} name="" id="">
					{filterStrings.map(([key, label]) =>
						<option
							key={key}
							value={key}
							id={'filter-' + key}>
							{label}
						</option>
					)}
				</select>
				</span>
				Titles
			</h2>
		</div>
	)
}
import React from "react";
import { StringMC, StringRT } from "../IntlStrings";
import authContext from "../Auth/authContext";

export default function SortControls({sorter, activeSort, direction}) {
	const {authenticated} = React.useContext(authContext);

	const sortOptions = [
		['title', 'Title', 'alpha'],
		['ratings.metacritic.rating', <StringMC />, 'numerical'],
		['ratings.rottentomatoes.rating', <StringRT />, 'numerical'],
		['ratings.imdb.rating', 'IMDB', 'numerical'],
		['ratings.colonel.rating', 'OmniCritic', 'numerical']
	]

	if (authenticated) sortOptions.push(['scrapeDate', 'Scrape Date']);

	function sort(e) {
		sorter(e.target.value, direction, getSortType(e.target.value));
	}

	function changeDirection(e) {
		sorter(activeSort, e.target.value, getSortType(activeSort));
	}

	function getSortType(key) {
		return sortOptions.find(so => so[0] == key)[2]
	}

	return (
		<div className="sort-controls">
			Sort by <span className="select">
				<select value={activeSort} onChange={sort} name="" id="">
					{sortOptions.map(o => 
						<option key={o[0]} value={o[0]}>{o[1]}</option>)}
				</select></span>
				<span className="select">
					<select value={direction} onChange={changeDirection} name="" id="">
						<option value="desc">descending</option>
						<option value="asc">ascending</option>
				</select></span>
		</div>
	)
}
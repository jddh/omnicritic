import React from "react";
import he from 'he';

export default function Results({data, searchTerm}) {
	const hasResults = searchTerm && data?.length > 0;

	return (
		<>
			{hasResults &&
			<ul id="search-autocomplete">
				{data.map(res =>
					<li key={res._id}>
						<a href={"/title/" + res._id}>
							{he.decode(res.title)}
						</a>
					</li>
				)}
			</ul>
			}
		</>
	)
}
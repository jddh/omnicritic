import React from "react";

export default function Results({data, searchTerm}) {
	return (
		<>
			{searchTerm &&
			<ul>
				{data.map(res =>
					<li key={res._id}>
						<a href={"/title/" + res._id}>{res.title}</a>
					</li>
				)}
			</ul>
			}
		</>
	)
}
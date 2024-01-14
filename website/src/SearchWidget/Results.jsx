import React from 'react';
import he from 'he';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import LoadStatus from '../LoadStatus';

export default function Results({ apiDispatcher, searchTerm }) {
	const hasResults = searchTerm && apiDispatcher.data?.length > 0;
	const hasContent = (apiDispatcher.isLoading || apiDispatcher.isError) || hasResults;

	return (
		<>
			<ul className={clsx(hasContent && 'active')} id='search-autocomplete'>
				<LoadStatus apiDispatcher={apiDispatcher}>
					{hasResults && apiDispatcher.data.map(res =>
						<li key={res._id}>
							{/* <a href={'/title/' + res._id}>
								{he.decode(res.title)}
							</a> */}
							<Link to={'/title/' + res._id}>{he.decode(res.title)}</Link>
						</li>
					)}
				</LoadStatus>
			</ul>
		</>
	)
}
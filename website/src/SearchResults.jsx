import React from 'react';
import {useParams} from 'react-router-dom';
import ListTable from './ListTable';
import useApi from './apiDispatcher';

export default function SearchResults() {
	const [api, getFromApi] = useApi();
	const {query} = useParams();
	const [searchTerm, setSearchTerm] = React.useState(query);

	React.useEffect(() => {
		(async() => {
			await getFromApi('search/' + query);
		})()
	}, []);

	return (
		<div className="App">
			<main>
				<div id="search-info">
					<h2>Search for: "{query}"</h2>
					<em>{api.data.length} results</em>
				</div>

				<ListTable apiFeed={api} />
			</main>
		</div>
	)

}
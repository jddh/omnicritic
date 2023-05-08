import React from 'react';
import {useParams} from 'react-router-dom';
import ListTable from './ListTable';
import useApi from './apiDispatcher';
import useSemiPersistentState from './semiPersistentState';

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
				<h2>Search for: "{query}"</h2> 

				<ListTable data={api.data} />
			</main>
		</div>
	)

}
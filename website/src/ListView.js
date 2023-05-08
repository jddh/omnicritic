import './App.scss';
import React from 'react';
import ListTable from './ListTable';
import FeedFilterButtons from './FilterButtons'
import StatusInfo from './StatusInfo';
import useApi from './apiDispatcher';
import useSemiPersistentState from './semiPersistentState';

function App() {

	const [filter, setFilter] = useSemiPersistentState('listFilter', 'rated');
	const [dbStatus, getFromDbStatus] = useApi();

	//runtime
	React.useEffect(() => {
		(async function() {
			await getFromApi(filter);

			await getFromDbStatus('status');
		})()
	}, []);

	const [apiFeed, getFromApi] = useApi();

	async function handleFilters(event) {
		const filter = event.target.value;
		setFilter(filter);
		const apiUrl = filter;
		await getFromApi(apiUrl);
	}

	return (

		<div className="App">
			{apiFeed.isLoading && <div>Loading...</div>}

			{apiFeed.isError && <div>Data fetch error!</div>}

			<main>
				<h2>Rated titles</h2>

				<FeedFilterButtons filter={filter} filterHandler={handleFilters} />

				<ListTable data={apiFeed.data} />

				<StatusInfo data={dbStatus.data}></StatusInfo>
			</main>
		</div>
	);
}


export default App;
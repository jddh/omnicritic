import './App.scss';
import React from 'react';
import ListTable from './ListTable';
import FeedFilterButtons from './FilterButtons'
import StatusInfo from './StatusInfo';
import useApi from './apiDispatcher';
import useSemiPersistentState from './semiPersistentState';
import LoadStatus from './LoadStatus';
import AuthOrHidden from './Auth/AuthOrHidden';

function App() {

	const [filter, setFilter] = useSemiPersistentState('listFilter', 'rated');
	const [dbStatus, getFromDbStatus] = useApi({useAuth: true});

	//runtime
	//TODO caching
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
			<LoadStatus apiDispatcher={apiFeed} />

			<main>
				<h2>Rated titles</h2>

				<FeedFilterButtons filter={filter} filterHandler={handleFilters} />

				<ListTable data={apiFeed.data} id="main-table" />

				<AuthOrHidden>
					<StatusInfo data={dbStatus.data}></StatusInfo>
				</AuthOrHidden>
			</main>
		</div>
	);
}


export default App;
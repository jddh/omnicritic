import './App.scss';
import React, { useContext } from 'react';
import ListTable from './ListTable';
import FeedFilterButtons from './FilterButtons'
import StatusInfo from './StatusInfo';
import useApi from './apiDispatcher';
import useSemiPersistentState from './semiPersistentState';
import LoadStatus from './LoadStatus';
import AuthOrHidden from './Auth/AuthOrHidden';
import authContext from "./Auth/authContext";

const titles = {
	all: ['All titles'],
	rated: ['Rated titles', <span><strong>Rated</strong> by at least one of the sources</span>],
	unrated: ['Unrated titles', <span><strong>Unrated</strong> titles have no ratings from any source</span>],
	nullrated: ['Nullrated titles', <span><strong>Null ratings</strong> have been scraped and returned as unavailable or nonexistant</span>]
}

//TODO loaded strings
function App() {

	const [filter, setFilter] = useSemiPersistentState('listFilter', 'rated');
	const [dbStatus, getFromDbStatus] = useApi({useAuth: true});
	const {authenticated} = useContext(authContext);

	//runtime
	React.useEffect(() => {
		(async function() {
			await getFromApi(filter);

			if (authenticated)
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

				<FeedFilterButtons filter={filter} filterHandler={handleFilters} />
				
				<div className="title-description"><em>{titles[filter][1]}</em></div>

				
				<ListTable data={apiFeed.data} id="main-table">
					<AuthOrHidden>
						<StatusInfo data={dbStatus.data}></StatusInfo>
					</AuthOrHidden>
				</ListTable>

			</main>
		</div>
	);
}


export default App;
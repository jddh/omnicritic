import './App.scss';
import React, { useContext } from 'react';
import ListTable from './ListTable';
import FeedFilterButtons from './ListTable/FilterButtons'
import StatusInfo from './StatusInfo';
import useApi from './apiDispatcher';
import useSemiPersistentState from './semiPersistentState';
import LoadStatus from './LoadStatus';
import AuthOrHidden from './Auth/AuthOrHidden';
import authContext from "./Auth/authContext";

const titles = {
	all: ['All titles'],
	rated: ['Rated titles', <span><strong>Rated</strong> by at least one of the sources</span>],
	unrated: ['Unrated titles', <span><strong>Unrated</strong> titles have no ratings (or haven't been checked recently)</span>],
	nullrated: ['Nullrated titles', <span><strong>Null ratings</strong> have been scraped and returned as unavailable or nonexistant</span>]
}

function App() {

	const [filter, setFilter] = useSemiPersistentState('listFilter', 'rated');
	const [dbStatus, getFromDbStatus] = useApi({useAuth: true});
	const {authenticated} = useContext(authContext);

	const [apiFeed, getFromApi] = useApi();

	//runtime
	React.useEffect(() => {
		(async function() {
			await getFromApi(filter);

			if (authenticated)
				await getFromDbStatus('status');
		})()
	}, []);

	async function handleFilters(event) {
		const filter = event.target.value;
		setFilter(filter);
		const apiUrl = filter;
		await getFromApi(apiUrl);
	}

	return (

		<div className="App">
			{/* <LoadStatus apiDispatcher={apiFeed} /> */}

			<main>

				<FeedFilterButtons filter={filter} filterHandler={handleFilters} />
				
				<div className="title-description"><em>{titles[filter][1]}</em></div>

				<ListTable apiFeed={apiFeed} id="main-table">
					<AuthOrHidden>
						<StatusInfo data={dbStatus.data}></StatusInfo>
					</AuthOrHidden>
				</ListTable>
			</main>
		</div>
	);
}


export default App;
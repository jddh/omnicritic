import logo from './logo.svg';
import './App.scss';
import React from 'react';
import ListItem from './ListItem';
import SearchBox from './SearchBox';
import FilterButtons from './FilterButtons'
import SortingColumn from './SortingColumn';

function dispatchApi(state, action) {
	switch(action.type) {
		case 'API_FETCH_INIT':
			return {
				...state,
				isLoading: true,
				isError: false
			}
		case 'API_FETCH_COMPLETE':
			return {
				data: action.payload,
				isLoading: false,
				isError: false
			}
		case 'API_FETCH_ERROR':
			return {
				...state,
				isLoading: false,
				isError: true
			}
	}
}

async function fetchFromApi(endpoint) {
	const ts = await fetch('http://localhost:4000/' + endpoint);
	const tsj = await ts.json();
	const data = tsj.map(d => {
		if (d.ratings?.metacritic?.rating == 'tbd')
			delete d.ratings.metacritic.rating;
		return d;
	});

	return data;
}

function App() {

	const [dataView, setDataView] = React.useState([]);
	const [searchTerm, setSearchTerm] = React.useState(localStorage.getItem('searchTerm') || '');
	const inputTimer = React.useRef(null);

	React.useEffect(() => {
		(async function() {
			dispatch({type:'API_FETCH_INIT'});
			fetchFromApi('rated')
			.then((ts) => {
				dispatch({type:'API_FETCH_COMPLETE', payload:ts});
			})
			.catch(() => {
				dispatch({type:'API_FETCH_ERROR'})
			})
		})()
	}, []);

	const [apiFeed, dispatch] = React.useReducer(dispatchApi, { data: [], isLoading: false, isError: false });

	React.useEffect(() => {
		setDataView(apiFeed.data);
	}, [apiFeed.data])

	React.useEffect(() => {
		localStorage.setItem('searchTerm',searchTerm);
	},[searchTerm])

	function handleSearch(event) {
		const term = event.target.value;

		clearTimeout(inputTimer.current);
		// inputTimer.current = setInterval(() => {
			let filteredData;
			setSearchTerm(term);
			// if (term.length)
			// 	filteredData = masterData.filter(i => i.title.match(new RegExp(term, 'gi')));
			// else filteredData = masterData;
			// setData(filteredData);
		// },500)
	}

	async function handleFilters(event) {
		const filter = event.target.id;
		const apiUrl = filter.replace(/filter-(.*?)/gi, '$1');
		const ts = await fetchFromApi(apiUrl);
		setDataView(ts);
	}

	const [activeSort, setActiveSort] = React.useState(false);

	function sorter(dataSource, direction = 'desc') {
		console.log('sorting ' + dataSource + ' ' + direction);
		let sortedData = [...dataView];
		sortedData = sortedData.sort((a, b) => {
			const ar = parseInt(a.ratings[dataSource]?.rating);
			const br = parseInt(b.ratings[dataSource]?.rating);
			
			if (direction == 'asc') {
				if (ar > br || ar && !br) return 1;
				if (ar < br || !ar && br) return -1;
			}
			else {
				if (ar > br || ar && !br) return -1;
				if (ar < br || !ar && br) return 1;
			}
			return 0;
		})

		setActiveSort(dataSource);
		setDataView(sortedData);
	}

	const dataForRender = dataView.filter(i => i.title.match(new RegExp(searchTerm, 'gi')));

	return (

		<div className="App">
			{apiFeed.isLoading && <div>Loading...</div>}

			{apiFeed.isError && <div>Data fetch error!</div>}

			<main>
				<h2>Rated titles</h2>
			
				<SearchBox searchHandler={handleSearch} searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>

				<FilterButtons filterHandler={handleFilters} />

				<table style={{ textAlign: 'left' }}>
					<thead>
						<tr>
							<td>Title</td>
							<SortingColumn sorter={sorter} dataSource='metacritic' activeSort={activeSort} label="MC Rating" />
							<SortingColumn sorter={sorter} dataSource='rottentomatoes' activeSort={activeSort} label="RT Rating" />
							<SortingColumn sorter={sorter} dataSource='imdb' activeSort={activeSort} label="IMDB Rating" />
						</tr>
					</thead>
					<tbody>
						{dataForRender.map(title =>
							<ListItem item={title} key={title._id} />
						)}
					</tbody>
				</table>
			</main>
		</div>
	);
}


export default App;
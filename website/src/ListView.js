import logo from './logo.svg';
import './App.scss';
import React from 'react';
import ListItem from './ListItem';
import SearchBox from './SearchBox';
import FilterButtons from './FilterButtons'
import SortingColumn from './SortingColumn';
import Pager from './Pager';
import StatusInfo from './StatusInfo';
import ParserButtons from './ParserButtons';

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

async function fetchDBStatus() {
	const s = await fetch('http://localhost:4000/status');
	const sj = await s.json();

	return sj;
}

function App() {

	const [dataView, setDataView] = React.useState([]);
	const [searchInput, setSearchInput] = React.useState(localStorage.getItem('searchTerm') || '');
	const [searchTerm, setSearchTerm] = React.useState(searchInput);
	const [dbStatus, setDBStatus] = React.useState({});
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

			setDBStatus(await fetchDBStatus());
		})()
	}, []);

	const [apiFeed, dispatch] = React.useReducer(dispatchApi, { data: [], isLoading: false, isError: false });

	React.useEffect(() => {
		setDataView(apiFeed.data);
	}, [apiFeed.data])

	React.useEffect(() => {
		localStorage.setItem('searchTerm',searchInput);
	},[searchInput])

	function handleSearch(event) {
		const term = event.target.value;
		setSearchInput(term);

		clearTimeout(inputTimer.current);
		inputTimer.current = setInterval(() => {
			setSearchTerm(term);
		},500)
	}

	async function handleFilters(event) {
		const filter = event.target.id;
		const apiUrl = filter.replace(/filter-(.*?)/gi, '$1');
		dispatch({type: 'API_FETCH_INIT'});
		const ts = await fetchFromApi(apiUrl);
		dispatch({type: 'API_FETCH_COMPLETE', payload: ts});
	}

	const [parsers, setParsers] = React.useState([]);

	/**
	 * given names, return filter fns
	 * @param {*} name 
	 * @returns 
	 */
	function getParsers(nameArray) {
		let parseFns = [];
		nameArray.forEach(name => {
			let parseFn;
			switch(name) {
				//disparate ratings
				case 'contentious':
					parseFn = item => 
						Math.abs(item.ratings?.metacritic?.rating - item.ratings?.rottentomatoes?.rating) > 10;
					break;
				case 'topten':
					parseFn = item =>
					item.ratings?.metacritic?.rating > 90 &&
					item.ratings?.rottentomatoes?.rating > 90
					break;
				default:
					parseFn = item => item;
			}
			parseFns.push(parseFn)
		})

		return parseFns;
	}

	//sorting
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

	//pagination
	const [pager, setPager] = React.useState({page: 1, limit: localStorage.getItem('pageLimit') || 100});

	React.useEffect(() => {
		localStorage.setItem('pageLimit',pager.limit);
	},[pager.limit])

	//prune data for render
	let filteredData = dataView.filter(i => i.title.match(new RegExp(searchTerm, 'gi')));

	// getParsers(parsers).forEach(p => 
	// 	filteredData = filteredData.filter(p));
	const parserArray = getParsers(parsers);
	if (parserArray.length)
		filteredData = filteredData.filter(element => parserArray.some(fn => fn(element)));
	
	let dataForRender = filteredData;
	if (pager.limit) dataForRender = dataForRender.slice(((pager.page-1) * pager.limit), (pager.page * pager.limit));

	return (

		<div className="App">
			{apiFeed.isLoading && <div>Loading...</div>}

			{apiFeed.isError && <div>Data fetch error!</div>}

			<main>
				<h2>Rated titles</h2>
			
				<SearchBox searchHandler={handleSearch} searchTerm={searchInput} setSearchTerm={setSearchInput}/>

				<FilterButtons filterHandler={handleFilters} />

				<ParserButtons setParsers={setParsers}/>

				<Pager pagerData={pager} setPagerData={setPager} totalCount={filteredData.length}></Pager>

				<table style={{ textAlign: 'left' }}>
					<thead>
						<tr>
							<td>Title</td>
							<SortingColumn sorter={sorter} dataSource='metacritic' activeSort={activeSort} >
								MC Rating
							</SortingColumn>
							<SortingColumn sorter={sorter} dataSource='rottentomatoes' activeSort={activeSort} >
								RT Rating
							</SortingColumn>
							<SortingColumn sorter={sorter} dataSource='colonel' activeSort={activeSort} >
								Colonel Rating
							</SortingColumn>
							<SortingColumn sorter={sorter} dataSource='imdb' activeSort={activeSort} >
								IMDB Rating
							</SortingColumn>
						</tr>
					</thead>
					<tbody>
						{dataForRender.map(title =>
							<ListItem item={title} key={title._id} />
						)}
					</tbody>
				</table>

				<StatusInfo data={dbStatus}></StatusInfo>
			</main>
		</div>
	);
}


export default App;
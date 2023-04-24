import logo from './logo.svg';
import './App.scss';
import React from 'react';
import ListItem from './ListItem';
import SearchBox from './SearchBox';
import FilterButtons from './FilterButtons'
import SortingColumn from './SortingColumn';

// import db from './lib/db/db.js';

function App() {

	const [data, setData] = React.useState([]);
	const [masterData, setMasterData] = React.useState([]);
	const [searchTerm, setSearchTerm] = React.useState(localStorage.getItem('searchTerm') || '');
	const inputTimer = React.useRef(null);

	React.useEffect(() => {
		(async function() {
			const ts = await fetchFromApi('rated');

			setMasterData(ts);
			setData(ts);

			// if (searchTerm) handleSearch({target:{value:searchTerm}});
		})()
	}, []);

	React.useEffect(() => {
		localStorage.setItem('searchTerm',searchTerm);
	},[searchTerm])

	const dataForRender = data.filter(i => i.title.match(new RegExp(searchTerm, 'gi')));

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
		setMasterData(ts);
		setData(ts);
	}

	function sortByScore() {
		console.log('sorting...');
		let sortedData = [...data];
		sortedData = sortedData.sort((a, b) => {
			const ar = parseInt(a.ratings?.metacritic.rating);
			const br = parseInt(b.ratings?.metacritic.rating);
			
			if (ar > br || ar && !br) return -1;
			if (ar < br || !ar && br) return 1;
			return 0;
		})

		setData(sortedData);
	}

	const [activeSort, setActiveSort] = React.useState(false);

	function sorter(dataSource, direction = 'desc') {
		console.log('sorting ' + dataSource + ' ' + direction);
		let sortedData = [...data];
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
		setData(sortedData);
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

	if (!data) return <div>Loading...</div>;

	return (
		<div className="App">
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
import React from "react";
import { FormattedMessage } from 'react-intl';
import ListItem from './ListItem';
import SearchBox from './ListSearch';
import SortingColumn from './SortingColumn';
import Pager from './Pager';
import ParserButtons from './ParserButtons';
import MainContent from "./Layout/MainContent";
import AuthOrHidden from './Auth/AuthOrHidden';
import useSemiPersistentState from './semiPersistentState';
import useApi from './apiDispatcher';
import authContext from "./Auth/authContext";

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
			case 'lowten':
				parseFn = item =>
				item.ratings?.metacritic?.rating < 21 &&
				item.ratings?.rottentomatoes?.rating < 21
				break;
			case 'justmc':
				parseFn = item =>
				item.ratings?.metacritic?.rating &&
				!item.ratings?.rottentomatoes?.rating
				break;
			case 'justrt':
				parseFn = item =>
				!item.ratings?.metacritic?.rating &&
				item.ratings?.rottentomatoes?.rating
				break;
			default:
				parseFn = item => item;
		}
		parseFns.push(parseFn)
	})

	return parseFns;
}

export default function ListTable({data, id, children}) {
	const [dataView, setDataView] = React.useState([]);
	const {authenticated} = React.useContext(authContext);
	const [parsers, setParsers] = useSemiPersistentState('listParser-'+id, []);

	//inline search
	const [searchInput, setSearchInput] = useSemiPersistentState('searchTerm','');
	const [searchTerm, setSearchTerm] = React.useState(searchInput);
	const inputTimer = React.useRef(null);

	//pagination
	const [pager, setPager] = React.useState({page: 1, limit: localStorage.getItem('pageLimit') || 100});

	//sorting
	const [activeSort, setActiveSort] = useSemiPersistentState('activeSort-'+id, false);
	const [sortDirection, setSortDirection] = useSemiPersistentState('sortDirection-'+id, 'desc');

	//favourites
	const [userApi, getFromUserApi] = useApi({ useAuth: true });

	React.useEffect(() => {
		setDataView(data);
	}, [data]);

	React.useEffect(() => {
		localStorage.setItem('pageLimit',pager.limit);
	},[pager.limit]);
	

	React.useEffect(() => {
		if (authenticated) {
			const favStatusRq = getFromUserApi('user/favourites');
		}
	}, [])

	function handleSearch(event) {
		const term = event.target.value;
		setSearchInput(term);

		clearTimeout(inputTimer.current);
		inputTimer.current = setInterval(() => {
			setSearchTerm(term);
		},500)
	}

	function changeSort(dataSource, direction) {
		setActiveSort(dataSource);
		direction && setSortDirection(direction);
	}

	function sorter(dataSource, direction = 'desc') {
		if (!dataSource) return dataView;
		let sortedData = [...dataView];
		const traverse = (obj, path) => path.split(".").reduce((ag, o) => ag[o] ? ag[o] : ag, obj);

		sortedData = sortedData.sort((a, b) => {
			const ar = parseInt(traverse(a,dataSource));
			const br = parseInt(traverse(b,dataSource));
			
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

		return sortedData;
	}

	//prune data for render
	// let filteredData = [], dataForRender = [];
	// if (dataView.length)
	// {
	// 	filteredData = sorter(activeSort, sortDirection);

	// 	filteredData = filteredData.filter(i => i.title.match(new RegExp(searchTerm, 'gi')));

	// 	const parserArray = getParsers(parsers);
	// 	if (parserArray.length)
	// 		filteredData = filteredData.filter(element => parserArray.some(fn => fn(element)));
		
	// 	dataForRender = filteredData;
	// 	if (pager.limit) dataForRender = dataForRender.slice(((pager.page-1) * pager.limit), (pager.page * pager.limit));
	// }

	const [filteredData, dataForRender] = React.useMemo(() => {
		let fd = [];
		if (!dataView.length) return [];
		fd = sorter(activeSort, sortDirection);

		fd = fd.filter(i => i.title.match(new RegExp(searchTerm, 'gi')));

		const parserArray = getParsers(parsers);
		if (parserArray.length)
			fd = fd.filter(element => parserArray.some(fn => fn(element)));
		
		let renderArray = fd;
		if (pager.limit) renderArray = renderArray.slice(((pager.page-1) * pager.limit), (pager.page * pager.limit));

		return [fd, renderArray];
	}, [dataView, activeSort, sortDirection, searchTerm, pager, parsers])


	return (
		<>
		<div id="search-parsers">
			<SearchBox searchHandler={handleSearch} searchTerm={searchInput} setSearchTerm={setSearchInput}/>
			<ParserButtons parsers={parsers} setParsers={setParsers}/>
		</div>

		<Pager pagerData={pager} setPagerData={setPager} totalCount={filteredData?.length}></Pager>

		{/* <em>{dataForRender?.length} titles shown, {filteredData?.length} total</em> */}

		<MainContent>
		<table>
			<thead>
				<tr>
					<td>Title</td>
					<SortingColumn sorter={changeSort} dataSource='ratings.metacritic.rating' activeSort={activeSort} parentDirection={sortDirection}>
					<FormattedMessage
          				defaultMessage="Metacritic"
          				description="Aggreator with 'Meta'"
        			/> 
					</SortingColumn>

					<SortingColumn sorter={changeSort} dataSource='ratings.rottentomatoes.rating' activeSort={activeSort} parentDirection={sortDirection}>
					<FormattedMessage
          				defaultMessage="Rotten Tomatoes"
          				description="Aggreator with 'Meta'"
        			/> 
					</SortingColumn>

					<SortingColumn sorter={changeSort} dataSource='ratings.imdb.rating' activeSort={activeSort} parentDirection={sortDirection}>
						IMDB 
					</SortingColumn>

					<SortingColumn sorter={changeSort} dataSource='ratings.colonel.rating' activeSort={activeSort} parentDirection={sortDirection}>
						Omnicritic 
					</SortingColumn>

					<AuthOrHidden>
						<SortingColumn sorter={changeSort} dataSource='scrapeDate' activeSort={activeSort} parentDirection={sortDirection}>
							Scrape date
						</SortingColumn>
					</AuthOrHidden>
				</tr>
			</thead>
			<tbody>
				{dataForRender?.map(title =>
					<ListItem 
						item={title} 
						key={title._id} 
						showFavourite={!userApi.isLoading && !userApi.isError}
						isFavourited={userApi.data.favourites?.includes(title._id)} 
					/>
				)}
			</tbody>
		</table>

		<Pager pagerData={pager} setPagerData={setPager} totalCount={filteredData?.length} showTotals={false}></Pager>

		{children}

		</MainContent>

		</>
	)
}
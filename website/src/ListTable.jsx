import React from "react";
import { FormattedMessage } from 'react-intl';
import clsx from "clsx";
import ListItem from './ListTable/ListItem';
import SearchBox from './ListTable/ListSearch';
import SortingColumn from './ListTable/SortingColumn';
import Pager from './Pager';
import SortControls from "./ListTable/SortControls";
import ParserButtons from './ListTable/ParserButtons';
import MainContent from "./Layout/MainContent";
import AuthOrHidden from './Auth/AuthOrHidden';
import Throbber from './Throbber';
import LoadStatus from "./LoadStatus";
import {StringMC, StringRT} from "./IntlStrings";
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

export default function ListTable({apiFeed, id, dataLoadStatus, children}) {
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
		setDataView(apiFeed.data);
	}, [apiFeed.data]);

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

		//is our dataset numerical? decide what our sort keys are
		const sortableValueType = traverse(sortedData[0],dataSource).toString().match(/\D/ig) ? 'alpha' : 'number';
		const sortableValueFn = getSortableValueFn(sortableValueType);

		sortedData = sortedData.sort((a, b) => {
			const [ar, br] = sortableValueFn(traverse(a,dataSource), traverse(b,dataSource))
			
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

		function getSortableValueFn(type) {
			if (type == 'number') 
				return (a,b) => [parseInt(a),parseInt(b)];
			//alpha
				return (a,b) => [a.charAt(0),b.charAt(0)];
			
		}
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

	const isDataPending = dataLoadStatus && (dataLoadStatus.isLoading || dataLoadStatus.isError);

	return (
		<>
		<div id="search-parsers">
			<SearchBox searchHandler={handleSearch} searchTerm={searchInput} setSearchTerm={setSearchInput}/>
			<ParserButtons parsers={parsers} setParsers={setParsers}/>
		</div>

		<SortControls sorter={changeSort} activeSort={activeSort} direction={sortDirection} />

		<Pager pagerData={pager} setPagerData={setPager} totalCount={filteredData?.length}></Pager>

		{/* <em>{dataForRender?.length} titles shown, {filteredData?.length} total</em> */}

		<MainContent>
				
		{/* {isDataPending && <Throbber />} */}

		<LoadStatus apiDispatcher={apiFeed}>
			
		<table className={clsx('data-list', isDataPending && 'pending')}>
			<thead>
				<tr>

					<SortingColumn type='alpha' sorter={changeSort} dataSource='title' activeSort={activeSort} parentDirection={sortDirection}>
						Title
					</SortingColumn>

					<SortingColumn sorter={changeSort} dataSource='ratings.metacritic.rating' activeSort={activeSort} parentDirection={sortDirection}>
						<StringMC />
					</SortingColumn>

					<SortingColumn sorter={changeSort} dataSource='ratings.rottentomatoes.rating' activeSort={activeSort} parentDirection={sortDirection}>
						<StringRT />
					</SortingColumn>

					<SortingColumn sorter={changeSort} dataSource='ratings.imdb.rating' activeSort={activeSort} parentDirection={sortDirection}>
						IMDB 
					</SortingColumn>

					<SortingColumn sorter={changeSort} dataSource='ratings.colonel.rating' activeSort={activeSort} parentDirection={sortDirection}>
						OmniCritic 
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

		</LoadStatus>

		{children}

		</MainContent>

		</>
	)
}
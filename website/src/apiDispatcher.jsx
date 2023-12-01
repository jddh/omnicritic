import React from "react";
import authContext from "./Auth/authContext";
import useSemiPersistentState from "./semiPersistentState";

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

/**
 * merge props into options.headers for use in fetch()
 * 
 * @param {object} options - fetch() options 
 * @param {object} header - props to merge 
 * @returns 
 */
function mergeHeaders(options, header) {
	let allHeaders = options?.headers
	  ? { ...options.headers, ...header }
	  : header;
	options = { ...options, headers: allHeaders };
  
	return options;
  }



/**
 * register service for querying api
 * @param {string} rqBasePath
 * @param {object} fetchOptions - passed to fetch() 
 * @param {boolean} useAuth - pass token with request
 * @returns {[object,function]} feed object with .data; call to fetch 
 */
export default function useApi(
	{
		rqBasePath = 'http://localhost:4000/', 
		fetchOptions = undefined,
		useAuth = false,
		useCache = true
	} = {
		rqBasePath: undefined, 
		fetchOptions: undefined,
		useAuth: undefined,
		useCache: undefined
	}) {

	const canCache = !useAuth && useCache;
	const { token } = React.useContext(authContext);
	let apiCache, setApiCache;
	if (canCache)
		{
			[apiCache, setApiCache] = useSemiPersistentState('apiCache',{});
		}

	function aggregateApiCache(entry) {
		const data = {...apiCache};
		Object.assign(data, entry);
		setApiCache(data);
	}

	async function fetchFromApi(base, endpoint, options) {
		//if !nocache param & GET & !useAuth & !env variable
		let cacheKey;
		if (canCache)
		//crunch params and check cache
		{
			cacheKey = JSON.stringify(options).toString()
				+ endpoint
		}
		//if cache & !expiry, get cache value
		let tsj, didFetch = false;
		if (canCache && apiCache[cacheKey]) {
				console.log('Cache finished loading: ', base + endpoint);
				tsj = apiCache[cacheKey];
			}
		//else:
		else {
			const ts = await fetch(base + endpoint, options);
		//if !nocache param & GET & !useAuth & !env variable & !nocache res
		//crunch params, store res & expiry/cache header
		//endif
			tsj = await ts.json();
			didFetch = true;
		}
		if (canCache && didFetch)
			aggregateApiCache({[cacheKey]: tsj});
		let data = tsj;
		if (Array.isArray(data)) {
			data = data.map(d => {
				if (d.ratings?.metacritic?.rating == 'tbd')
					delete d.ratings.metacritic.rating;
				return d;
			});
		}
	
		return data;
	}

	const get = async function (endpoint, options) {
		if (useAuth && token) {
			options = mergeHeaders(options, {Authorization: 'Basic ' + token});
		}

		dispatch({type:'API_FETCH_INIT'});
		fetchFromApi(rqBasePath, endpoint, {...options, ...fetchOptions})
		.then((ts) => {
			dispatch({type:'API_FETCH_COMPLETE', payload:ts});
		})
		.catch((e) => {
			dispatch({type:'API_FETCH_ERROR'})
		})
	}

	const [apiFeed, dispatch] = React.useReducer(dispatchApi, { data: [], isLoading: false, isError: false });

	return [apiFeed, get];
}
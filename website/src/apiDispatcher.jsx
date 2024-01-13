import React from "react";
import authContext from "./Auth/authContext";

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

function checkForCachedData(key) {
	let storedValue = localStorage.getItem(key) && JSON.parse(localStorage.getItem(key));
	return storedValue || false;
}

/**
 * register service for querying api
 * responses are aggresively cached in localstorage if they are public (expects Cache-Control headers)
 * we are not using useSemiPersistentState because storage keys are scoped to individual requests, whereas the hook is scoped to general use
 * 
 * @param {string} rqBasePath
 * @param {object} fetchOptions - passed to fetch() 
 * @param {boolean} useAuth - pass token with request
 * @returns {[object,function]} feed object with .data; call to fetch 
 */
export default function useApi(
	{
		rqBasePath = 
			window.location.protocol + '//' + 
			(import.meta.env.VITE_API_URL ? 
			import.meta.env.VITE_API_URL : (window.location.hostname + ':4000')) + '/', 
		fetchOptions = undefined,
		useAuth = false,
		useCache = true
	} = {
		rqBasePath: undefined, 
		fetchOptions: undefined,
		useAuth: undefined,
		useCache: undefined
	}) {

	const isPublicSocket = !useAuth && useCache;
	const { token } = React.useContext(authContext);

	async function fetchFromApi(base, endpoint, options) {
		//if !nocache param & GET & !useAuth & !env variable
		const canCache = isPublicSocket && options?.method != 'post';
		let cacheKey, cacheLoad, tsj, cacheHeaders, didFetch = false, isCached = false;;
		if (canCache)
			cacheKey = 'cache-' + JSON.stringify(options).toString() + endpoint;
		//crunch params and check cache
		//if cache & !expiry, get cache value
		// let tsj, cacheHeaders, didFetch = false, isCached = false;
		if (cacheKey) cacheLoad = checkForCachedData(cacheKey);
		if (canCache && cacheLoad) {
			let validCache = true;
			const cache = cacheLoad;
			if (!cache.res.length) return;
			const timeStamp = cache.time;
			const age = parseInt(cache.age);
			if (timeStamp && age) {
				if (new Date().getTime()/1000 > timeStamp + age) {
					console.log('Invalidated cache', base + endpoint);
					localStorage.removeItem(cacheKey);
					validCache = false;
				}
			}
			if (validCache) {
				console.log('Cache finished loading: ', base + endpoint);
				tsj = JSON.parse(cacheLoad.res);
				isCached = true;
			}
		}
		//else: fetch()
		if (!isCached) {
			const ts = await fetch(base + endpoint, options);
			cacheHeaders = ts.headers.get('Cache-Control');
			tsj = await ts.json();
			didFetch = true;
		}
		//if !nocache param & GET & !useAuth & !env variable & !nocache res
		//crunch params, store res & expiry/cache header
		if (didFetch && canCache) {
			const age = cacheHeaders?.match(/age=(\d+)/i)?.[1] || false;
			const currentSeconds = Math.round(new Date().getTime()
			/ 1000);
			const cachePayload = JSON.stringify({
				res: JSON.stringify(tsj),
				time: currentSeconds, age
			})
			localStorage.setItem(cacheKey, cachePayload);
		}
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
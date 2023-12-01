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

async function fetchFromApi(base, endpoint, options) {
	const ts = await fetch(base + endpoint, options);
	const tsj = await ts.json();
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
		useAuth = false
	} = {
		rqBasePath: undefined, 
		fetchOptions: undefined,
		useAuth: undefined
	}) {

	const { token } = React.useContext(authContext);

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
import React from "react";

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

async function fetchFromApi(base, endpoint) {
	const ts = await fetch(base + endpoint);
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

export default function useApi(rqBasePath = 'http://localhost:4000/') {
	async function get(endpoint) {
		dispatch({type:'API_FETCH_INIT'});
		fetchFromApi(rqBasePath, endpoint)
		.then((ts) => {
			dispatch({type:'API_FETCH_COMPLETE', payload:ts});
		})
		.catch(() => {
			dispatch({type:'API_FETCH_ERROR'})
		})
	}

	const [apiFeed, dispatch] = React.useReducer(dispatchApi, { data: [], isLoading: false, isError: false });

	return [apiFeed, get];
}
import React from "react";
import SearchField from './SearchField';
import Results from './Results';
import useApi from '../apiDispatcher';


export default function SearchWidget() {
	const [api, getFromApi] = useApi();
	const [searchTerm, setSearchTerm] = React.useState('');

	React.useEffect(() => {
		if (!searchTerm) return;
		(async () => {
		await getFromApi('title/search/' + searchTerm);
		})();
	}, [searchTerm])

	return (
		<div>
			<SearchField setSearchQuery={setSearchTerm}/>
			<Results searchTerm={searchTerm} data={api.data}/>
		</div>
	)
}
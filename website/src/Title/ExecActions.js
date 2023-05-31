import React from "react";
import useApi from '../apiDispatcher';

export default function ExecActions({id}) {

	const [api, getFromApi] = useApi({ useAuth: true });
	const [rateSource, setRateSource] = React.useState('metacritic');
	const [apiResponse, setApiResponse] = React.useState('');

	const sources = ['metacritic','rottentomatoes'];

	React.useEffect(() => {
		setApiResponse((api.data === false) ? 'unrated' : api.data);
	},[api.data])

	function changeSource(e) {
		setRateSource(e.target.value);
	}

	async function getRating(e) {
		e.preventDefault();
		const source = e.target['rating-source'].value;
		const ratingRq = await getFromApi('title/get/rate', {
			method: 'post', 
			body: JSON.stringify({id: id, source: source}),
			headers: {'Content-Type': 'application/json'}
		});
	}

	return (
	<>
		<h3>Admin</h3>

		<h4>Get ratings</h4>
		<form onSubmit={getRating} id="get-rating">
			<select name="rating-source" id="rating-source">
				{sources.map(s => 
					<option 
						value={s} 
						onChange={changeSource} 
						defaultValue={s == rateSource} 
						disabled={s == 'rottentomatoes'}
						key={s}>
					{s}</option>
				)}
			</select>
			<input type="submit" value="Go" />
		</form>

		<div className="exec-results">
			{apiResponse}
		</div>
	</>
	)
}
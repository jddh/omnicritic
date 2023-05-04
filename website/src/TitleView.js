import { useParams } from 'react-router-dom';
import React from 'react';
import useApi from './ApiDispatcher';

export default function ItemView() {
	const {titleid} = useParams();
	const [api, getFromApi] = useApi();

	React.useEffect(() => {
		(async () => {
			await getFromApi('title/' + titleid);
		})()
	}, [])

	const item = api.data;

	return (
		<div className="App">
			{api.isLoading && <div>Loading...</div>}

			{api.isError && <div>Fetch error!</div>}

			{!api.isError && !api.isLoading &&

			<main>
				<h1>{item.title}</h1>
				<div>
					{item.synopsis}
				</div>

				<div className="scores">
					{item.ratings?.metacritic?.rating &&
					<div className='mc'>Metacritic: {item.ratings.metacritic.rating}</div>}


					{item.ratings?.rottentomatoes?.rating &&
					<div className='rt'>Rotten Tomatoes: {item.ratings.rottentomatoes.rating}</div>}

					{item.ratings?.colonel?.rating &&
					<div className='colonel'><strong>Colonel: {item.ratings.colonel.rating}</strong></div>}
				</div>

				<div className="links">
					<ul>
						{item.ratings?.metacritic?.url &&
						<li><a target="_blank" href={item.ratings.metacritic.url}>Metacritic</a></li>}

						{item.ratings?.rottentomatoes?.url &&
						<li><a target="_blank" href={item.ratings.rottentomatoes.url}>RT</a></li>}

						{item.imdbId &&
						<li><a target="_blank" href={"https://www.imdb.com/title/" + item.imdbId}>IMDB</a></li>}

						<li><a target="_blank" href={"https://www.netflix.com/watch/" + item.netflixId}>Netflix</a></li>
					</ul>
				</div>
			</main>

			}
		</div>
	)
}
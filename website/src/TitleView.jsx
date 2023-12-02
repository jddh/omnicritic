import { useParams } from 'react-router-dom';
import React from 'react';
import useApi from './apiDispatcher';
import SearchWidget from './SearchWidget/SearchWidget'
import LoadStatus from './LoadStatus';
import Favourite from './Title/Favourite';
import ExecActions from './Title/ExecActions';
import AuthOrHidden from './Auth/AuthOrHidden';
import {heObj} from './utils';

export default function ItemView() {
	const {titleid} = useParams();
	const [api, getFromApi] = useApi({useCache: false});

	React.useEffect(() => {
		(async () => {
			await getFromApi('title/' + titleid);
		})()
	}, [])

	const item = heObj(api.data);

	return (
		<div className="App">

			<LoadStatus apiDispatcher={api}/>

			{!api.isError && !api.isLoading &&

			<main>
				<h1>{item.title} ({item.releaseDate})</h1>
				<em>{item.type}</em>
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

				<Favourite titleId={item._id} />

				<AuthOrHidden>
					<div className="scrape-meta">
						<h4>Scrape info</h4>
						Unogs: {new Date(item.scrapeDate).toLocaleString()} <br />
						Metacritic: {
							item.ratings?.metacritic && 
							new Date(item.ratings?.metacritic?.timestamp).toLocaleString()}
						<br />
						RT: {
							item.ratings?.rottentomatoes && 
							new Date(item.ratings?.rottentomatoes?.timestamp).toLocaleString()}
					</div>

					<ExecActions id={item._id} />
				</AuthOrHidden>
			</main>

			}
		</div>
	)
}
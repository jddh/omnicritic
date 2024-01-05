import { useParams } from 'react-router-dom';
import React from 'react';
import { useIntl } from "react-intl";
import useApi from './apiDispatcher';
import SearchWidget from './SearchWidget/SearchWidget'
import MainContent from "./Layout/MainContent";
import LoadStatus from './LoadStatus';
import Favourite from './Title/Favourite';
import ExecActions from './Title/ExecActions';
import AuthOrHidden from './Auth/AuthOrHidden';
import {heObj} from './utils';

export default function ItemView() {
	const intl = useIntl();
	const {titleid} = useParams();
	const [api, getFromApi] = useApi({useCache: false});

	React.useEffect(() => {
		(async () => {
			await getFromApi('title/' + titleid);
		})()
	}, [])

	const netflixStr = intl.formatMessage({
		defaultMessage: 'Netflix',
		description: 'link label for netflix',
		id: 'netflixlink'
	})
	const mcStr = intl.formatMessage({
		defaultMessage: 'Metacritic',
		description: 'link label for metacritic',
		id: 'mclink'
	})
	const rtStr = intl.formatMessage({
		defaultMessage: 'Rotten Tomatoes',
		description: 'link label for RT',
		id: 'rtlink'
	})

	const item = heObj(api.data);

	return (
		<MainContent className="page-title">

			<LoadStatus apiDispatcher={api}/>

			{!api.isError && !api.isLoading &&

			<>
				<h1>{item.title} ({item.releaseDate})</h1>
				<div className="content">
					<em className='media-type'>{item.type}</em>
					<div>
						{item.synopsis}
					</div>
					{/* TODO viz for scores */}
					<div className="scores">
						{item.ratings?.metacritic?.rating &&
						<div className='mc'>{mcStr} score: {item.ratings.metacritic.rating}</div>}
						{item.ratings?.rottentomatoes?.rating &&
						<div className='rt'>{rtStr} score: {item.ratings.rottentomatoes.rating}</div>}
						{item.ratings?.colonel?.rating &&
						<div className='colonel'><strong>OmniCritic score: {item.ratings.colonel.rating}</strong></div>}
					</div>
					<div className="links">
						<ul>
							{item.ratings?.metacritic?.url &&
							<li><a target="_blank" href={item.ratings.metacritic.url}>{mcStr}</a></li>}

							{item.ratings?.rottentomatoes?.url &&
							<li><a target="_blank" href={item.ratings.rottentomatoes.url}>{rtStr}</a></li>}

							{item.imdbId &&
							<li><a target="_blank" href={"https://www.imdb.com/title/" + item.imdbId}>IMDB</a></li>}

							<li><a target="_blank" href={"https://www.netflix.com/watch/" + item.netflixId}>{netflixStr}</a></li>
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
				</div>
			</>

			}
		</MainContent>
	)
}
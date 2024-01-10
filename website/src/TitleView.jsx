import { useParams } from 'react-router-dom';
import React from 'react';
import { useIntl } from "react-intl";
import useApi from './apiDispatcher';
import SearchWidget from './SearchWidget/SearchWidget'
import MainContent from "./Layout/MainContent";
import Score from './Score';
import { StringMC, StringRT } from "./IntlStrings";
import LoadStatus from './LoadStatus';
import Favourite from './Title/Favourite';
import ExecActions from './Title/ExecActions';
import AuthOrHidden from './Auth/AuthOrHidden';
import { heObj } from './utils';

export default function ItemView() {
	const intl = useIntl();
	const { titleid } = useParams();
	const [api, getFromApi] = useApi({ useCache: false });

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

	const item = heObj(api.data);

	const mcRating = item.ratings?.metacritic?.rating;
	const mcURL = item.ratings?.metacritic?.url;
	const rtRating = item.ratings?.rottentomatoes?.rating;
	const rtURL = item.ratings?.rottentomatoes?.url;

	return (
		<MainContent className="page-title">

			<LoadStatus apiDispatcher={api} />

			{!api.isError && !api.isLoading &&

				<>
					<h1>{item.title} ({item.releaseDate})</h1>
					<div className="content">
						<em className='media-type'>{item.type}</em>
						<div className='synopsis'>
							{item.synopsis}
						</div>

						<div className="scores">
							{mcRating &&
								<div className='mc score'>
									{mcURL ? <a href={mcURL}>
									<StringMC />  <Score score={item.ratings.metacritic.rating} />
									</a>
									: <><StringMC />  <Score score={item.ratings.metacritic.rating} /></>
								}</div>}

							{rtRating &&
								<div className='rt score'>
									{rtURL ? <a href={rtURL}>
									<StringRT />  <Score score={item.ratings.rottentomatoes.rating} /></a>
									: <><StringRT />  <Score score={item.ratings.rottentomatoes.rating} /></>
								}</div>}

							{item.ratings?.colonel?.rating &&
								<div className='colonel score'><strong>OmniCritic  <Score score={item.ratings.colonel.rating} /></strong></div>}
						</div>

						<div className="links">
							<h3>Watch</h3>
							<ul>
								{/* {item.ratings?.metacritic?.url &&
									<li><a target="_blank" href={item.ratings.metacritic.url}><StringMC /></a></li>}

								{item.ratings?.rottentomatoes?.url &&
									<li><a target="_blank" href={item.ratings.rottentomatoes.url}><StringRT /></a></li>} */}

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
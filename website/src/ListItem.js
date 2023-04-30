import * as he from 'he';

export default function ListItem({item}) {
	return(
	  <tr key={item._id}>
			<td>{he.decode(item.title)}</td>
			<td>
				{item.ratings?.metacritic?.rating &&
				item.ratings.metacritic.rating}
			</td>
			<td>
				{item.ratings?.rottentomatoes?.rating &&
				item.ratings.rottentomatoes.rating}
			</td>
			
			<td>
				{item.ratings?.imdb?.rating &&
				item.ratings.imdb.rating}
			</td>

			<td>
				{item.ratings?.metacritic?.url &&
				<a target="_blank" href={item.ratings.metacritic.url}>Metacritic</a>}
			</td>

			<td>
				{item.ratings?.rottentomatoes?.url &&
				<a target="_blank" href={item.ratings.rottentomatoes.url}>RT</a>}
			</td>

			<td>
				{item.imdbId &&
				<a target="_blank" href={"https://www.imdb.com/title/" + item.imdbId}>IMDB</a>}
			</td> 

			<td>
				<a target="_blank" href={"https://www.netflix.com/watch/" + item.netflixId}>Netflix</a>
			</td>
	  </tr>
	)
  }
  

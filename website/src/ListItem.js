export default function ListItem(props) {
	return(
	  <tr key={props.item._id}>
		<td>{props.item.title}</td>
			<td>
				{props.item.ratings?.metacritic.rating &&
				props.item.ratings.metacritic.rating}
			</td>

			<td>
				{props.item.ratings?.metacritic.url &&
				<a href={props.item.ratings.metacritic.url}Metacritic></a>}
			</td>

			<td>
				{props.item.imdbId &&
				<a target="_blank" href={"https://www.imdb.com/title/" + props.item.imdbId}>IMDB</a>}
			</td> 
	  </tr>
	)
  }
  

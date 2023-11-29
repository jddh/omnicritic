import * as he from 'he';
import AuthOrHidden from './Auth/AuthOrHidden';
import Favourite from './Title/Favourite';

export default function ListItem({item, isFavourited, showFavourite}) {

	return(
	  <tr key={item._id}>
			<td>
				<a href={"/title/" + item._id}>
					{he.decode(item.title)}
				</a>
			</td>
			<td className='numerical'>
				{item.ratings?.metacritic?.rating &&
				item.ratings.metacritic.rating}
			</td>
			<td className='numerical'>
				{item.ratings?.rottentomatoes?.rating &&
				item.ratings.rottentomatoes.rating}
			</td>
			
			<td className='numerical'>
				{item.ratings?.imdb?.rating &&
				item.ratings.imdb.rating}
			</td>

			<td className='numerical'>
				{item.ratings?.colonel?.rating &&
				item.ratings.colonel.rating}
			</td>

			<AuthOrHidden>
				<td className=' small'>
					{new Date(item.scrapeDate).toLocaleDateString(undefined,{month:'short',day:'numeric'})}
				</td>
			</AuthOrHidden>
			
			{showFavourite &&
			<AuthOrHidden>
				<td>
					<Favourite titleId={item._id} isActive={isFavourited} />
				</td>
			</AuthOrHidden>
			}
	  </tr>
	)
  }
  

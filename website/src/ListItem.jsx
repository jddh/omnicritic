import * as he from 'he';
import Score from './Score';
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
				 <Score score={item.ratings.metacritic.rating} />}
			</td>
			<td className='numerical'>
				{item.ratings?.rottentomatoes?.rating &&
				 <Score score={item.ratings.rottentomatoes.rating} />}
			</td>
			
			<td className='numerical'>
				{item.ratings?.imdb?.rating &&
				<Score score={item.ratings.imdb.rating * 10} />}
			</td>

			<td className='numerical'>
				{item.ratings?.colonel?.rating &&
				<Score score={item.ratings.colonel.rating} />}
			</td>

			<AuthOrHidden>
				<td className=' small'>
					{new Date(item.scrapeDate).toLocaleDateString()}
				</td>
			</AuthOrHidden>
			
			{showFavourite &&
			<AuthOrHidden>
				<td className='favourite'>
					<Favourite titleId={item._id} isActive={isFavourited} />
				</td>
			</AuthOrHidden>
			}
	  </tr>
	)
  }
  

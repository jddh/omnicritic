import * as he from 'he';
import clsx from 'clsx';
import Score from '../Score';
import AuthOrHidden from '../Auth/AuthOrHidden';
import Favourite from '../Title/Favourite';
import { StringMC, StringRT } from '../IntlStrings';

export default function ListItem({ item, isFavourited, showFavourite }) {

	const hasMC = item.ratings?.metacritic?.rating;
	const hasRT = item.ratings?.rottentomatoes?.rating;
	const hasIMDB = item.ratings?.imdb?.rating > -1;
	const hasColonel = item.ratings?.colonel?.rating;

	return (
		<tr key={item._id}>
			<td className='title'>
				<a href={"/title/" + item._id}>
					{he.decode(item.title)}
				</a>
			</td>
			<td className={clsx('numerical', !hasMC && 'empty')}>
				{hasMC &&
					<>
						<span className="data-label">
							<StringMC />
						</span>
						<Score score={item.ratings.metacritic.rating} />
					</>
				}
			</td>
			<td className={clsx('numerical', !hasRT && 'empty')}>
				{hasRT &&
					<>
						<span className="data-label">
							<StringRT />
						</span>
						<Score score={item.ratings.rottentomatoes.rating} />
					</>
				}
			</td>

			<td className={clsx('numerical', !hasIMDB && 'empty')}>
				{hasIMDB &&
					<>
					<span className="data-label">
							IMDB
						</span>
					<Score score={item.ratings.imdb.rating * 10} />
					</>
				}
			</td>

			<td className={clsx('numerical', !hasColonel && 'empty')}>
				{hasColonel &&
					<>
					<span className="data-label">
							OmniCritic
						</span>
					<Score score={item.ratings.colonel.rating} />
					</>
				}
			</td>

			<AuthOrHidden>
				<td className='scrape-date small'>
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


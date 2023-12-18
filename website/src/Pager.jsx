import clsx from 'clsx';

const rangeEllipsis = '…';

//https://www.zacfukuda.com/blog/pagination-algorithm
//BUG: multiple ellipses can appear after clicking around 
function paginate({current, max}) {
	if (!current || !max) return null

	let prev = current === 1 ? null : current - 1,
			next = current === max ? null : current + 1,
			items = [1]

	if (current === 1 && max === 1) return {current, prev, next, items}
	if (current > 4) items.push(rangeEllipsis)

	let r = 2, r1 = current - r, r2 = current + r

	for (let i = r1 > 2 ? r1 : 2; i <= Math.min(max, r2); i++) items.push(i)

	if (r2 + 1 < max) items.push('…')
	if (r2 < max) items.push(max)

	return {current, prev, next, items}
}

export default function Pager ({pagerData, setPagerData, totalCount, showTotals = true}) {
	function changeLimit(event) {
		setPagerData({...pagerData, limit: event.target.value});
	}

	function setPage(num) {
		setPagerData({...pagerData, page: num});
	}

	let limitOptions = [10,50,100,500];
	
	const totalPages = Math.ceil(totalCount/pagerData.limit);
	const pagination = paginate({current:pagerData.page, max:totalPages});

	return (
		<div className={clsx('pager', showTotals && 'large')}>
			

			{pagination?.items.length > 1 &&
			<ul className="pagination-links">
				
				{pagerData.page > 1 &&
					<li><a onClick={() => setPage(pagerData.page-1)} href="#">Prev</a></li>
				}

				{pagination.items.map((page => 
					<li key={page}>
					{page != pagerData.page && page != rangeEllipsis &&
						<a  
							onClick={() => setPage(page)}
							>
							{page}
						</a>
					}
					{((page == pagerData.page) || (page === rangeEllipsis)) &&
						<span className="current">{page}</span>
					}
					</li>	
				))}
				
				{pagerData.page < totalPages &&
					<li><a onClick={() => setPage(pagerData.page+1)} href="#">Next</a></li>
				}	
			</ul>
			}

			{showTotals && <div className="totals">
				<em>
					<span className="select">
						<select name="pager-limit" id="pager-limit" defaultValue={pagerData.limit} onChange={changeLimit}>
						{limitOptions.map(op =>
							<option
								value={op}
								key={op}
							>
							{op}</option>
						)}
						</select>
					</span>
					titles shown, {totalCount} total
				</em>
			</div>}
		</div>
	)
}
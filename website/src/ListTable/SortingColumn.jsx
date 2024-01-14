import React from 'react';
import clsx from 'clsx';

export default function SortingColumn({sorter, dataSource, activeSort, parentDirection, type = 'numerical', children}) {

	const [direction, setDirection] = React.useState(parentDirection);

	function sortColumn() {
		let newDirection;
		switch(direction) {
			case undefined:
				newDirection = 'desc';
			break;
			case 'desc':
				newDirection = 'asc';
			break;
			default:
				newDirection = 'desc';
		}
		setDirection(newDirection);
	}

	React.useEffect(() => {
		if (direction && direction != parentDirection)
		sorter(dataSource, direction, type);
	},[direction])

	const isActive = activeSort == dataSource;

	return (
		<td 
		onClick={sortColumn} 
		className={clsx('sorting-col', type == 'numerical' && ' numerical', `direction-${direction}`, isActive && ' active')} id={"sortfor-" + dataSource}>
			{children}
		</td>
	)
}
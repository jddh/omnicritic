import React from 'react';

export default function SortingColumn({sorter, dataSource, activeSort, children}) {

	const [direction, setDirection] = React.useState();

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
		if (direction) 
		sorter(dataSource,direction);
	},[direction])

	const isActive = activeSort == dataSource;

	return (
		<td 
		onClick={sortColumn} 
		className={`sorting-col direction-${direction} ${isActive && ' active'}`} id={"sortfor-" + dataSource}>
			{children}
		</td>
	)
}
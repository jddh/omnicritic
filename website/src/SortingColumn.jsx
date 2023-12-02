import React from 'react';

export default function SortingColumn({sorter, dataSource, activeSort, parentDirection, children}) {

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
		sorter(dataSource, direction);
	},[direction])

	const isActive = activeSort == dataSource;

	return (
		<td 
		onClick={sortColumn} 
		className={`sorting-col numerical direction-${direction} ${isActive && ' active'}`} id={"sortfor-" + dataSource}>
			{children}
		</td>
	)
}
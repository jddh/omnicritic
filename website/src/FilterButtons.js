export default function FilterButtons(props) {
	return (
		<div className="filter-buttons">
			<button id="filter-all" onClick={props.filterHandler}>All</button>
			<button id="filter-rated" onClick={props.filterHandler}>Rated</button>
			<button id="filter-unrated" onClick={props.filterHandler}>Unrated</button>
		</div>
	)
}
export default function SearchBox(props) {
	return(
		<div className="search-box">
			<label htmlFor="search-term">Search: </label>
			<input type="text" onChange={props.searchHandler} name="search-term" id="search-term" />
		</div>
	)
}
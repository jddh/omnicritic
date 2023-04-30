
export default function SearchBox({searchHandler,searchTerm,setSearchTerm}) {
	function clear() {
		setSearchTerm('');
		searchHandler({target: {value: ''}});
	}

	return(
		<div className="search-box">
			<label htmlFor="search-term">Search: </label>
			<input type="text" onChange={searchHandler} name="search-term" id="search-term" value={searchTerm} />
			<button className="clear" onClick={clear}>clear</button>
		</div>
	)
}
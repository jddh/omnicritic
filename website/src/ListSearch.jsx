
export default function SearchBox({searchHandler,searchTerm,setSearchTerm}) {
	function clear() {
		setSearchTerm('');
		searchHandler({target: {value: ''}});
	}

	return(
		<div className="search-box">
			<input type="text" placeholder="Filter list" onChange={searchHandler} name="search-term" id="search-term" value={searchTerm} />
			<button className="clear" onClick={clear}>clear</button>
		</div>
	)
}
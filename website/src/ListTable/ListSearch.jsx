import { useIntl } from "react-intl";

export default function SearchBox({searchHandler,searchTerm,setSearchTerm}) {
	const intl = useIntl();

	function clear(e) {
		e.preventDefault();
		setSearchTerm('');
		searchHandler({target: {value: ''}});
	}

	return(
		<div className="search-box">
			<input type="text" placeholder="Search list"
				 onChange={searchHandler} name="search-term" id="search-term" value={searchTerm} />
			<input type="reset" value="clear" onClick={clear} />
		</div>
	)
}
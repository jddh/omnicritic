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
			<input type="text" placeholder={intl.formatMessage({
					defaultMessage: 'Stranger Things, Succession, Batman',
					description: 'placeholder text for table search',
					id: 'jerkface'
				})}
				 onChange={searchHandler} name="search-term" id="search-term" value={searchTerm} />
			<input type="reset" value="clear" onClick={clear} />
		</div>
	)
}
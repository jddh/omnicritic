import { useIntl } from "react-intl";

export default function SearchBox({searchHandler,searchTerm,setSearchTerm}) {
	const intl = useIntl();

	function clear() {
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
			<button className="clear" onClick={clear}>clear</button>
		</div>
	)
}
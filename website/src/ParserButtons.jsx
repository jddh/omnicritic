import { useIntl } from "react-intl";

export default function ParserButtons ({parsers, setParsers}) {
	const intl = useIntl();

function changeValues(event) {
	let activeParserNames = [];
	document.querySelectorAll('[type=checkbox][name=parsers]:checked').forEach(el => activeParserNames.push(el.value));
	console.log(activeParserNames);
	setParsers(activeParserNames)
}

const options = [
	['contentious', 'Contentious', 'Disparate ratings between sources'],
	['topten', 'Top Ten', 'At least one high rating'],
	['lowten', 'Bottom Ten', 'Low ratings'],
	['justmc', intl.formatMessage({
		defaultMessage: 'Metacritic',
		description: 'parser for mc',
		id: 'justmc'
	})],
	['justrt', intl.formatMessage({
		defaultMessage: 'Rotten Tomatoes',
		description: 'parser for rt'
	})]
];

return (
	<div className="parsers">
		<fieldset>
			{options.map(([key, label, title]) => 
				<label className="checkbox" htmlFor={key} key={key} title={title}>
					<input 
						type="checkbox" 
						name="parsers" 
						id={key} 
						value={key} 
						
						checked={parsers.includes(key)}
						onChange={changeValues} />
					{label}
				</label>
			)}
		</fieldset>
	</div>
)

}
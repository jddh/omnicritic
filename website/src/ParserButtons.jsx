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
	['contentious', 'Contentious'],
	['topten', 'Top Ten'],
	['lowten', 'Bottom Ten'],
	['justmc', intl.formatMessage({
		defaultMessage: 'Just Metacritic',
		description: 'parser for mc',
		id: 'parser-mc'
	})],
	['justrt', intl.formatMessage({
		defaultMessage: 'Just Rottenpotatoes',
		description: 'parser for rt',
		id: 'parser-rt'
	})]
];

return (
	<div className="parsers">
		<fieldset>
			{options.map(([key, label]) => 
				<label htmlFor={key} key={key}>
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
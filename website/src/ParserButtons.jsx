import { useIntl } from "react-intl";
import {StringMC, StringRT} from "./IntlStrings";

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
	['justmc', <StringMC />],
	['justrt', <StringRT />]
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
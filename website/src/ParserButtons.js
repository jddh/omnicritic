export default function ParserButtons ({parsers, setParsers}) {

function changeValues(event) {
	let activeParserNames = [];
	document.querySelectorAll('[type=checkbox][name=parsers]:checked').forEach(el => activeParserNames.push(el.value));
	console.log(activeParserNames);
	setParsers(activeParserNames)
}

const options = ['contentious','topten','lowten','justmc','justrt'];

return (
	<div className="parsers">
		<fieldset>
			{options.map(op => 
				<label htmlFor={op} key={op}>
					<input 
						type="checkbox" 
						name="parsers" 
						id={op} 
						value={op} 
						checked={parsers.includes(op)}
						onChange={changeValues} />
					{op}
				</label>
			)}
		</fieldset>
	</div>
)

}
export default function StatusInfo({data}) {
	const propItems = [];
	for (const prop in data) {
		propItems.push(<li key={prop}>{prop}: {data[prop]}</li>);
	}

	return (
		<div>
			<h1>Status</h1>
			{Object.keys(data).length &&
				<ul>
					{propItems.map(p => p)}
				</ul>
			}
		</div>
	)
}
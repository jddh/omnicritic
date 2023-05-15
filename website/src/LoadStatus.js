export default function LoadStatus({apiDispatcher}) {
	return (
		<>
			{apiDispatcher.isLoading && <div>Loading...</div>}

			{apiDispatcher.isError && <div>Fetch error!</div>}
		</>
	)
}
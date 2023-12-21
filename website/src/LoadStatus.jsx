import Throbber from './Throbber';

export default function LoadStatus({apiDispatcher, children}) {
	return (
		<>
			{apiDispatcher.isLoading && <Throbber />}

			{apiDispatcher.isError && <Throbber status="error" />}

			{(!apiDispatcher.isLoading && !apiDispatcher.isError) && children}
		</>
	)
}
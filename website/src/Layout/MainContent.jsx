export default function MainContent({className, children}) {
	return (
		<main className={className} id="main-content">
			{children}
		</main>
	)
}
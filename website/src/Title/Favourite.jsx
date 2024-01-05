import React, { useContext } from "react";
import AuthOrHidden from '../Auth/AuthOrHidden';
import useApi from '../apiDispatcher';
import authContext from "../Auth/authContext";

export default function Favourite({titleId, isActive}) {
	const {authenticated} = useContext(authContext);
	const [userApi, getFromUserApi] = useApi({ useAuth: true });
	const [userModApi, getFromUserModApi] = useApi({ useAuth: true });
	const [active, setActive] = React.useState(isActive || false);
	const apiTo = React.useRef();

	React.useEffect(() => {
		//cancel fetching if unloaded
		if (isActive == undefined && authenticated) {
			apiTo.current = setTimeout(() => {
				const favStatusRq = getFromUserApi('user/favourites');
			}, 0);
			

			return () => {
				clearTimeout(apiTo.current)
			};
		}
	}, [])

	React.useEffect(() => {
		if (userApi.data.favourites?.includes(titleId))
			setActive(true);
	}, [userApi.data.favourites])

	async function handleClick(e) {
		e.preventDefault();

		const newState = !active;
		setActive(newState);

		if (newState) {
			const favRq = await getFromUserModApi('user/favourites', {
				method: 'post', 
				body: JSON.stringify({titles: [titleId]}),
				headers: {'Content-Type': 'application/json'}
			});
		}
		if (!newState) {
			const favRq = await getFromUserModApi('user/favourites/remove', {
				method: 'post', 
				body: JSON.stringify({titles: [titleId]}),
				headers: {'Content-Type': 'application/json'}
			});
		}
	}

	return (
		<AuthOrHidden>
			{!userApi.isLoading &&
			<>
				<span className="favourite-label">Favourite:</span> 
				<a href="#" onClick={handleClick} className={`favourite ${active ? 'active': ''}`}> {active ? '✅':''} Favourite</a>
			</>
			}
		</AuthOrHidden>
	)
}
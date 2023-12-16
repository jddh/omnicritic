import {useContext, useEffect} from "react";
import AuthOrLogin from '../Auth/AuthOrLogin';
import useApi from '../apiDispatcher';
import authContext from "../Auth/authContext";
import ListTable from '../ListTable';

export default function Watchlist() {
	const {authenticated} = useContext(authContext);
	const [userApi, getFromUserApi] = useApi({ useAuth: true });

	useEffect(() => {
		if (authenticated) {
			const favStatusRq = getFromUserApi('user/favourites/docs');
		}
	}, [])

	return (
		<AuthOrLogin>
			<ListTable data={userApi.data} id="favourites" />
		</AuthOrLogin>
	)
}
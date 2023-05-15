import React from "react";
import Authenticated from '../Auth/Authenticated';
import useAuth from "../Auth/useAuth";
import useApi from '../apiDispatcher';

export default function Settings() {
	const [token, setToken] = useAuth();
	const [userApi, getFromUserApi] = useApi({
		fetchOptions: {headers: {Authorization: 'Basic ' + token}}
	});

	React.useEffect(() => {
		(async () => {
		if (!token) return;

		const userInfoRq = await getFromUserApi('user');

		})()
	}, [token])

	const user = userApi.data;

	return (
		<Authenticated>
			<h2>Here are your settings</h2>

			<p>Your name is {user.name}</p>
		</Authenticated>
	)
}
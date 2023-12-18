import React from "react";
import AuthOrLogin from '../Auth/AuthOrLogin';
import useApi from '../apiDispatcher';
import authContext from "../Auth/authContext";

export default function Settings() {
	const { token } = React.useContext(authContext);
	const [userApi, getFromUserApi] = useApi({ useAuth: true });

	React.useEffect(() => {
		(async () => {
		if (!token) return;

		const userInfoRq = await getFromUserApi('user');

		})()
	}, [token])

	const user = userApi.data;
	const loginTime = new Date(user.authTime).toString();

	return (
		<main id="main-content">
		<AuthOrLogin>
			<h2 className="page-title">Here are your settings</h2>

			<p>Your name is {user.username}</p>

			<small><em>Last login was {loginTime}</em></small>
		</AuthOrLogin>
		</main>
	)
}
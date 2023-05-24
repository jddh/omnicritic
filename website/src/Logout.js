import React from "react";
import { useNavigate, redirect } from "react-router-dom";
import authContext from "./Auth/authContext";
import useApi from './apiDispatcher'

export default function Logout() {
	const navigate = useNavigate();
	const { setAuthenticated, setToken, token } = React.useContext(authContext);
	const [authApi, getFromAuthApi] = useApi();

	React.useEffect(() => {
		(async () => {

		setToken('');
		setAuthenticated(false);
		const authLogout = await getFromAuthApi('logout', {
			method: 'post',
			body: JSON.stringify({token: token}),
			headers: {'Content-Type': 'application/json'}
		})
		window.location.pathname = '/';

		})()
	}, [])

	
}
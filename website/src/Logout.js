import React from "react";
import { useNavigate, redirect } from "react-router-dom";
import authContext from "./Auth/authContext";

export default function Logout() {
	const navigate = useNavigate();
	const { setAuthenticated, setToken } = React.useContext(authContext);

	React.useEffect(() => {
		setToken('');
		setAuthenticated(false);
		window.location.pathname = '/';
		//TODO: rm token from db
	}, [])

	
}
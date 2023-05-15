import React from "react";
import { useNavigate, redirect } from "react-router-dom";
import useAuth from "./Auth/useAuth";

export default function Logout() {
	const navigate = useNavigate();
	const [token, setToken] = useAuth();

	React.useEffect(() => {
		setToken('');
		window.location.pathname = '/';
	}, [])

	
}
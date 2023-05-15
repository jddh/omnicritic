import React from "react";
import LoginForm from "./LoginForm";
import useAuth from "./useAuth";

export default function Authenticated({children}) {
	const [token, setToken] = useAuth();

	return (
		<>

		{!token && <LoginForm setToken={setToken} /> }

		{token && children }

		</>
	)
}
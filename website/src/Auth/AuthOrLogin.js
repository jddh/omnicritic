import React from "react";
import LoginForm from "./LoginForm";
import authContext from "./authContext";

export default function Authenticated({children}) {
	const { token } = React.useContext(authContext);

	return (
		<>

		{!token && <LoginForm /> }

		{token && children }

		</>
	)
}
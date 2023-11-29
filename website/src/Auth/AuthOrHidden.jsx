import React from "react";
import authContext from "./authContext";

export default function Authenticated({children}) {
	const { token } = React.useContext(authContext);

	return (
		<>

		{token && children }

		</>
	)
}
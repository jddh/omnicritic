import React from "react";
import useSemiPersistentState from "../semiPersistentState";

export default function useAuth() {
	// const [token, setToken] = React.useState(localStorage.getItem('authToken'), '');

	// React.useEffect(() => localStorage.setItem('authToken',token), [token]);
	const [token, setToken] = useSemiPersistentState('authToken', '');

	return [token, setToken]
}
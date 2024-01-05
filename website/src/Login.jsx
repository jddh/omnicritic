import { useContext } from "react";
import MainContent from "./Layout/MainContent";
import LoginForm from "./Auth/LoginForm";
import authContext from "./Auth/authContext";

export default function Login() {
	const { token } = useContext(authContext);
	if (token) window.location.pathname = '/';
	
	return (
		<MainContent>
			<LoginForm />
		</MainContent>
	)
}
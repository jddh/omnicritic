import React from "react";
import useApi from '../apiDispatcher'
import authContext from "./authContext";

const feedbackStrings = {
	BAD_CREDENTIALS: 'Something\'s not right! Please check your username and password',
	MISSING_CREDENTIALS: 'Missing username or password',
	BAD_RESPONSE: 'Something\'s wrong on our end. Please try again later'
}

export default function LoginForm() {
	const [authApi, getFromAuthApi] = useApi({useCache: false});
	const { setAuthenticated, setToken } = React.useContext(authContext);
	const [userMessage, setUserMessage] = React.useState();

	React.useEffect(() => {
		if (authApi.data?.token) {
			setToken(authApi.data.token); 
			setAuthenticated(true);
		}

		if (authApi.data?.message == '401')
			setUserMessage('BAD_CREDENTIALS');

		if (authApi.isError) setUserMessage('BAD_RESPONSE');
	}, [authApi])

	async function handleSubmit(e) {
		e.preventDefault();
		setUserMessage();
		const user = e.target.username.value;
		const pass = e.target.password.value;
		if (!user || !pass) setUserMessage('MISSING_CREDENTIALS');

		const loginRq = await getFromAuthApi('login', {
			method: 'post', 
			body: JSON.stringify({username: user, password: pass}),
			headers: {'Content-Type': 'application/json'}
		});

		// if (authApi.data?.token) setToken(authApi.data.token); 

	}

	return (
		<form onSubmit={handleSubmit}>
			<label>
				<input type="text" name="username" id="username" placeholder="login" required/><br />
			</label>
			<label>
				<input type="password" name="password" id="password" placeholder="password" required /><br />
			</label>

			<input type="submit" value="Submit" />

			<div className="message">{feedbackStrings[userMessage]}</div>
		</form>
	)
}
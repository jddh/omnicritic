import React from "react";
import useApi from '../apiDispatcher'

export default function LoginForm({setToken}) {
	const [authApi, getFromAuthApi] = useApi();

	React.useEffect(() => {
		if (authApi.data?.token) setToken(authApi.data.token); 
	}, [authApi])

	async function handleSubmit(e) {
		e.preventDefault();
		const user = e.target.username.value;
		const pass = e.target.password.value;
		if (!user || !pass) alert('fill in the form dummy');

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
				<input type="text" name="username" id="username" placeholder="login"/><br />
			</label>
			<label>
				<input type="password" name="password" id="password" placeholder="password"/><br />
			</label>

			<input type="submit" value="Submit" />
		</form>
	)
}
import React from "react";
import { Link } from "react-router-dom";
import SearchWidget from "./SearchWidget/SearchWidget";
import authContext from "./Auth/authContext";

export default function Header() {
	const { authenticated, token } = React.useContext(authContext);

	return (
		<header>
			<nav>
				<ul>
					<li>
						<Link to="/">Home</Link>
					</li>
					<li>
						<Link to="/settings">Settings</Link>
					</li>
					{token && 
					<li>
						<Link to="/logout">Logout</Link>
					</li>
					}
				</ul>
			</nav>

			user is {`${authenticated ? "" : "not"} authenticated`}

			<SearchWidget />

		</header>
	)
}


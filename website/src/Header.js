import React from "react";
import { Link } from "react-router-dom";
import SearchWidget from "./SearchWidget/SearchWidget";
import useAuth from "./Auth/useAuth";

export default function Header() {
	const [token, setToken] = useAuth();

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

			<SearchWidget />
			
		</header>
	)
}


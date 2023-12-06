import React from "react";
import { push as Menu } from 'react-burger-menu';
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

					{!token && 
					<li>
						<Link to="/login">Login</Link>
					</li>}

					{token && 
					<>
					<li>
						<Link to="/watchlist">Watchlist</Link>
					</li>
					<li>
						<Link to="/settings">Settings</Link>
					</li>
					<li>
						<Link to="/logout">Logout</Link>
					</li>
					</>
					}

				</ul>
			</nav>

			{/* user is {`${authenticated ? "" : "not"} authenticated`} */}

			<SearchWidget />

			<Menu pageWrapId={"App"} outerContainerId={ "root" }>
				<a id="home" className="menu-item" href="/">Home</a>
				<a id="about" className="menu-item" href="/about">About</a>
				<a id="contact" className="menu-item" href="/contact">Contact</a>
			</Menu>

		</header>
	)
}


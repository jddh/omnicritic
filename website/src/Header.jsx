import React from "react";
import { Link } from "react-router-dom";
import SearchWidget from "./SearchWidget/SearchWidget";
import authContext from "./Auth/authContext";
//TODO dismiss search autocomplete
export default function Header() {
	const { authenticated, token } = React.useContext(authContext);

	return (
		<header>
			<div id="site-title">
				<Link to="/">OmniCritic</Link>
			</div>

			<SearchWidget />

		</header>
	)
}


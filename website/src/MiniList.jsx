import React from "react";
import ListItem from "./ListItem";

export default function MiniList({data}) {
	<table>
		<tbody>
		{data.map(title =>
			<ListItem item={title} key={title._id} />
		)}
		</tbody>
	</table>
}
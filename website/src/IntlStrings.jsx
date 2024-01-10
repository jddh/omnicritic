import React from "react";
import { FormattedMessage, useIntl, createIntl, createIntlCache } from 'react-intl';

const cache = createIntlCache();
const intle = createIntl({
	locale: 'en',
	messages: {}
}, cache)

export function StringMC() {
	return (<FormattedMessage
		defaultMessage="Metacritic"
		description="Top level MC component"
		id="tlmcc"
	/>)
}

export function StringRT() {
	return (<FormattedMessage
		defaultMessage="Rotten Tomatoes"
		description="Top level RT component"
	/>)
}

// export function altStringMC() {
// 	const intl = useIntl();
// 	const str = intl.formatMessage({
// 		defaultMessage: 'Metacritic',
// 		description: 'Top level MC imperative string',
// 		id: "tlmcs"
// 	})

// 	return str
// }

// export default intle.formatMessage({
// 	defaultMessage: 'Metacritics',
// 	description: 'Top level MC string',
// 	id: "tlmcct"
// });
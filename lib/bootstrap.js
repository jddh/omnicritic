import args from '#models/arguments';

export default async function bootStrap(actions) {
	const action = args('action');

	if (actions[action]) await actions[action]();
	else throw new Error('action doesn\'t exist');
}
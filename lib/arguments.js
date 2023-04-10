import { argv } from 'node:process';

let args,processed;

export default function processArgs(arg) {
	if (!processed) firstRun();

	if (arg) {
		return args[arg] || false;
	}
	else return args;
}

function firstRun() {
	args = {};
	argv.forEach(a => {
		if (a.match(/\=/g)) {
			const parts = a.split('=');
			args[parts[0]] = parts[1];
		}
	});
	processed = true;
}
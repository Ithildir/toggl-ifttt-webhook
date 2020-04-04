const TogglClient = require('toggl-api');
const { promisify } = require('util');

const { AUTH_TOKEN, TOGGL_API_TOKEN } = process.env;

const toggl = new TogglClient({ apiToken: TOGGL_API_TOKEN });

const getCurrentTimeEntryAsync = promisify(toggl.getCurrentTimeEntry.bind(toggl));
const startTimeEntryAsync = promisify(toggl.startTimeEntry.bind(toggl));
const stopTimeEntryAsync = promisify(toggl.stopTimeEntry.bind(toggl));

function startTimer({ description }) {
	return startTimeEntryAsync({ description });
}

function stopTimer() {

}

module.exports = async (req, res) => {
	const { auth, cmd } = req.body;

	if (auth !== AUTH_TOKEN) {
		return res.status(403);
	}

	if (cmd === 'start') {
		await startTimer(req.body);
	} else if (cmd === 'stop') {
		await stopTimer();
	} else {
		return res.status(400);
	}

	return res.status(201);
};

const TogglClient = require('toggl-api');
const { promisify } = require('util');

const { TOGGL_API_TOKEN, WEBHOOK_AUTH_TOKEN } = process.env;

const toggl = new TogglClient({ apiToken: TOGGL_API_TOKEN });

const getCurrentTimeEntryAsync = promisify(
  toggl.getCurrentTimeEntry.bind(toggl)
);
const startTimeEntryAsync = promisify(toggl.startTimeEntry.bind(toggl));
const stopTimeEntryAsync = promisify(toggl.stopTimeEntry.bind(toggl));

function sendStatus(res, status, message) {
  return res.status(status).send(message);
}

async function stopTimer() {
  const timeEntry = await getCurrentTimeEntryAsync();

  if (timeEntry) {
    await stopTimeEntryAsync(timeEntry.id);

    console.log(
      `Stopped time entry ${timeEntry.id}: "${timeEntry.description}"`
    );
  }
}

async function startTimer({ description }) {
  await stopTimer();

  const fixedDescription = description.trim().toLowerCase();

  const timeEntry = await startTimeEntryAsync({
    description: fixedDescription,
  });

  console.log(`Started time entry ${timeEntry.id}: "${timeEntry.description}"`);
}

module.exports = async (req, res) => {
  const { auth, cmd } = req.body;

  if (auth !== WEBHOOK_AUTH_TOKEN) {
    return sendStatus(res, 403);
  }

  if (cmd === 'start') {
    await startTimer(req.body);
  } else if (cmd === 'stop') {
    await stopTimer();
  } else {
    return sendStatus(res, 400, 'Wrong cmd');
  }

  return sendStatus(res, 200);
};

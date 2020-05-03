const toggl = require('../operations/toggl');
const { sendStatus, withAuth } = require('../utils');

module.exports = withAuth(async (req, res) => {
  const { cmd } = req.body;

  if (cmd === 'start') {
    await toggl.startTimer(req.body);
  } else if (cmd === 'stop') {
    await toggl.stopTimer();
  } else {
    return sendStatus(res, 400, 'Wrong cmd');
  }

  return sendStatus(res, 200);
});

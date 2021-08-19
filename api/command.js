const fitness = require('../operations/fitness');
const { sendStatus, withAuth } = require('../utils');

module.exports = withAuth(async (req, res) => {
  const cmd = req.body.cmd.toLowerCase().trim();

  if (cmd === 'drank honey bottle') {
    await fitness.addHydrationData(0.5);
  } else {
    return sendStatus(res, 400, 'Wrong cmd');
  }

  return sendStatus(res, 200);
});

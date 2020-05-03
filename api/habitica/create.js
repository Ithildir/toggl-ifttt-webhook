const { sendStatus, withAuth } = require('../../utils');
const habitica = require('../../operations/habitica');

module.exports = withAuth(async (req, res) => {
  const { auth, ...options } = req.body;

  await habitica.createTask(options);

  return sendStatus(res, 200);
});

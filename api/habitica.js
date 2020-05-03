const { sendStatus, withAuth } = require('../utils');
const habitica = require('../operations/habitica');

module.exports = withAuth(async (req, res) => {
  const { direction = 'up', taskId } = req.body;

  if (!taskId) {
    return sendStatus(res, 400, 'Missing taskId');
  }

  await habitica.score({ direction, taskId });

  return sendStatus(res, 200);
});

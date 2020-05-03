const request = require('superagent');
const { sendStatus, withAuth } = require('../utils');

const { HABITICA_API_KEY, HABITICA_USER_ID } = process.env;

module.exports = withAuth(async (req, res) => {
  const { direction = 'up', taskId } = req.body;

  if (!taskId) {
    return sendStatus(res, 400, 'Missing taskId');
  }

  await request
    .post(`https://habitica.com/api/v3/tasks/${taskId}/score/${direction}`)
    .set({
      'x-api-key': HABITICA_API_KEY,
      'x-api-user': HABITICA_USER_ID,
      'x-client': `${HABITICA_USER_ID}-Testing`,
    });

  console.log(`Scored Habitica task ${taskId} ${direction}`);

  return sendStatus(res, 200);
});

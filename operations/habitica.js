const superagent = require('superagent');
const { fixText } = require('../utils');

const { HABITICA_API_KEY, HABITICA_USER_ID } = process.env;

const HABITICA_HEADERS = {
  'x-api-key': HABITICA_API_KEY,
  'x-api-user': HABITICA_USER_ID,
  'x-client': `${HABITICA_USER_ID}-Testing`,
};

const PRIORITIES = Object.freeze({
  trivial: 0.1,
  easy: 1,
  medium: 1.5,
  hard: 2,
});

async function createTask(options) {
  const { body } = await superagent
    .post('https://habitica.com/api/v3/tasks/user')
    .set(HABITICA_HEADERS)
    .send({
      ...options,
      text: fixText(options.text),
    });

  console.log(`Created Habitica ${body.data.type} ${body.data.id}`);
}

async function getTasks(type) {
  const { body } = await superagent
    .get('https://habitica.com/api/v3/tasks/user')
    .query({ type })
    .set(HABITICA_HEADERS);

  if (!body.success) {
    throw new Error(`Habitica failed when getting ${type}tasks`);
  }

  return body.data;
}

async function score({ direction, taskId }) {
  await superagent
    .post(`https://habitica.com/api/v3/tasks/${taskId}/score/${direction}`)
    .set(HABITICA_HEADERS);

  console.log(`Scored Habitica task ${taskId} ${direction}`);
}

module.exports = {
  PRIORITIES,
  createTask,
  getTasks,
  score,
};

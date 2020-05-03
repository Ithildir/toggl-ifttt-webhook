const request = require('superagent');
const habiticaKeywords = require('./habiticaKeywords.json');

const { HABITICA_API_KEY, HABITICA_USER_ID } = process.env;

async function score({ direction, taskId }) {
  await request
    .post(`https://habitica.com/api/v3/tasks/${taskId}/score/${direction}`)
    .set({
      'x-api-key': HABITICA_API_KEY,
      'x-api-user': HABITICA_USER_ID,
      'x-client': `${HABITICA_USER_ID}-Testing`,
    });

  console.log(`Scored Habitica task ${taskId} ${direction}`);
}

function scoreByKeyword(s) {
  const taskId = Object.keys(habiticaKeywords).find((key) =>
    habiticaKeywords[key].some((keyword) => s.includes(keyword))
  );

  if (taskId) {
    return score({ direction: 'up', taskId });
  }

  return null;
}

module.exports = {
  score,
  scoreByKeyword,
};

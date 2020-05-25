const whisk = require('../operations/whisk');
const { sendStatus, withAuth } = require('../utils');

module.exports = withAuth(async (req, res) => {
  const { url } = req.body;

  await whisk.addRecipe(url);

  return sendStatus(res, 200);
});

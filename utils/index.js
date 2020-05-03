function fixText(text) {
  let fixedText = text.trim();

  if (fixedText.toLowerCase().startsWith('i ')) {
    fixedText = fixedText.slice(2);
  }

  return `${fixedText.charAt(0).toUpperCase()}${fixedText.slice(1)}`;
}

function sendStatus(res, status, message) {
  return res.status(status).send(message);
}

function withAuth(fn) {
  return (req, res) => {
    if (req.body.auth !== process.env.WEBHOOK_AUTH_TOKEN) {
      return sendStatus(res, 403);
    }

    return fn(req, res);
  };
}

module.exports = {
  fixText,
  sendStatus,
  withAuth,
};

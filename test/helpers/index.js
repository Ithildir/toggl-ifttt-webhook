const sinon = require('sinon');

function createRes() {
  const res = {
    send: sinon.stub(),
    status: sinon.stub(),
  };
  res.status.returns(res);

  return res;
}

module.exports = {
  createRes,
};

const test = require('ava');
const nock = require('nock');
const sinon = require('sinon');
const toggl = require('../../api/toggl');
const { createRes } = require('../helpers');

test.beforeEach(() => {
  nock.disableNetConnect();
});

test.afterEach.always(() => {
  nock.cleanAll();
  nock.enableNetConnect();
  sinon.restore();
});

test.serial('Should fail if unauthenticated', async (t) => {
  const req = {
    body: {},
  };
  const res = createRes();

  await toggl(req, res);

  t.is(res.status.callCount, 1);
  t.deepEqual(res.status.firstCall.args, [403]);
  t.is(res.send.callCount, 1);
});

test.serial('Should fail if cmd is invalid', async (t) => {
  const req = {
    body: {
      auth: 'test-auth',
      cmd: 'foo',
    },
  };
  const res = createRes();

  await toggl(req, res);

  t.is(res.status.callCount, 1);
  t.deepEqual(res.status.firstCall.args, [400]);
  t.is(res.send.callCount, 1);
  t.deepEqual(res.send.firstCall.args, ['Wrong cmd']);
});

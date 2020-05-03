const test = require('ava');
const nock = require('nock');
const sinon = require('sinon');
const score = require('../../../api/habitica/score');
const { createRes } = require('../../helpers');

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

  await score(req, res);

  t.is(res.status.callCount, 1);
  t.deepEqual(res.status.firstCall.args, [403]);
  t.is(res.send.callCount, 1);
});

test.serial('Should fail if the taskId is not specified', async (t) => {
  const req = {
    body: {
      auth: 'test-auth',
    },
  };
  const res = createRes();

  await score(req, res);

  t.is(res.status.callCount, 1);
  t.deepEqual(res.status.firstCall.args, [400]);
  t.is(res.send.callCount, 1);
  t.deepEqual(res.send.firstCall.args, ['Missing taskId']);
});

test.serial('Should call Habitica', async (t) => {
  const taskId = 'test-task-id';

  const req = {
    body: {
      auth: 'test-auth',
      taskId,
    },
  };
  const res = createRes();

  const habiticaScoreNock = nock('https://habitica.com', {
    reqheaders: {
      'x-api-key': 'test-habitica',
      'x-api-user': 'test-habitica-user',
      'x-client': `test-habitica-user-Testing`,
    },
  })
    .post(`/api/v3/tasks/${taskId}/score/up`)
    .reply(200);

  await score(req, res);

  t.true(habiticaScoreNock.isDone());

  t.is(res.status.callCount, 1);
  t.deepEqual(res.status.firstCall.args, [200]);
  t.is(res.send.callCount, 1);
});

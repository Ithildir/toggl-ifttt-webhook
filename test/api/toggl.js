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

test.serial(
  'Should stop the Toggl timer and score the corresponding Habitica task',
  async (t) => {
    const timer = {
      id: 1234,
      description: 'do the dishes',
    };

    nock('https://www.toggl.com', {
      reqheaders: {
        authorization: `Basic dGVzdC10b2dnbDphcGlfdG9rZW4=`,
      },
    })
      .get('/api/v8/time_entries/current')
      .reply(200, {
        data: timer,
      });

    const togglStopNock = nock('https://www.toggl.com', {
      reqheaders: {
        authorization: `Basic dGVzdC10b2dnbDphcGlfdG9rZW4=`,
      },
    })
      .put(`/api/v8/time_entries/${timer.id}/stop`)
      .reply(200, {
        data: timer,
      });

    const habiticaScoreNock = nock('https://habitica.com', {
      reqheaders: {
        'x-api-key': 'test-habitica',
        'x-api-user': 'test-habitica-user',
        'x-client': `test-habitica-user-Testing`,
      },
    })
      .post(`/api/v3/tasks/20c5bfa1-97ce-4508-8958-ac04d5744532/score/up`)
      .reply(200);

    const req = {
      body: {
        auth: 'test-auth',
        cmd: 'stop',
      },
    };
    const res = createRes();

    await toggl(req, res);

    t.true(togglStopNock.isDone());
    t.true(habiticaScoreNock.isDone());

    t.is(res.status.callCount, 1);
    t.deepEqual(res.status.firstCall.args, [200]);
    t.is(res.send.callCount, 1);
  }
);

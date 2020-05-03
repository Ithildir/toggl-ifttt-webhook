const test = require('ava');
const nock = require('nock');
const sinon = require('sinon');
const create = require('../../../api/habitica/create');
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

  await create(req, res);

  t.is(res.status.callCount, 1);
  t.deepEqual(res.status.firstCall.args, [403]);
  t.is(res.send.callCount, 1);
});

test.serial('Should call Habitica', async (t) => {
  const req = {
    body: {
      auth: 'test-auth',
      text: '   do something new     ',
      type: 'todo',
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
    .post(`/api/v3/tasks/user`, {
      text: 'Do something new',
      type: 'todo',
    })
    .reply(200, {
      data: {
        id: '829d435b-edc4-498c-a30e-e52361a0f35a',
      },
    });

  await create(req, res);

  t.true(habiticaScoreNock.isDone());

  t.is(res.status.callCount, 1);
  t.deepEqual(res.status.firstCall.args, [200]);
  t.is(res.send.callCount, 1);
});

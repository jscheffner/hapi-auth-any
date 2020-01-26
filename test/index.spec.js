const test = require('ava');
const { AggregateError } = require('p-any');
const { isBoom } = require('@hapi/boom');
const { setup: setupAll, setupServerAndPlugin, request } = require('./utils');

test('fail if all fail', async (t) => {
  const server = await setupAll([false, false, false]);
  const { statusCode, result } = await request(server);

  t.is(statusCode, 401);
  t.is(result.message, 'Strategy strategy-0: Missing Credentials, Strategy strategy-1: Missing Credentials, Strategy strategy-2: Missing Credentials');
});

test('provide causes of failing strategies', async (t) => {
  const server = await setupAll([false, false, false, false]);
  const listener = new Promise((resolve) => {
    server.events.on({ name: 'request', channels: 'internal' }, (req, event) => {
      resolve(event.error);
    });
  });

  request(server);
  const err = await listener;

  t.log(err);
  t.true(err instanceof AggregateError);
  t.true(isBoom(err));
  t.is([...err].length, 4);
  t.true([...err].every(isBoom));
});

test('succeed if all succeed', async (t) => {
  const server = await setupAll([true, true, true, true]);
  const { statusCode } = await request(server);

  t.is(statusCode, 200);
});

test('succeed if one succeeds', async (t) => {
  const server = await setupAll([false, false, false, true, false, false]);
  const { statusCode } = await request(server);

  t.is(statusCode, 200);
});

test('succeed if some succeeds', async (t) => {
  const server = await setupAll([false, true, false, true, false, true]);
  const { statusCode } = await request(server);

  t.is(statusCode, 200);
});

test('do not expose message of server errors', async (t) => {
  const server = await setupServerAndPlugin();
  server.auth.scheme('error', () => ({ authenticate: () => { throw new Error('Test Error'); } }));
  server.auth.strategy('error', 'error');
  server.auth.strategy('any', 'any', { strategies: ['error'] });
  server.auth.default('any');

  const { statusCode, result } = await request(server);
  t.log(result);
  t.is(statusCode, 401);
  t.deepEqual(result, {
    error: 'Unauthorized',
    message: 'Strategy error: An internal server error occurred',
    statusCode: 401,
  });
});

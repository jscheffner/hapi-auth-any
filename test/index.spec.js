const test = require('ava');
const { setup: setupAll, setupServerAndPlugin, request } = require('./utils');

test('register plugin and create strategy', async (t) => {
  const server = await setupServerAndPlugin();
  t.is(typeof server.auth._schemes.any, 'function');
});

test('fail if all fail', async (t) => {
  const server = await setupAll([false, false, false]);
  const { statusCode, result } = await request(server);

  t.is(statusCode, 401);
  t.is(result.message, 'Strategy strategy-0: Missing Credentials, Strategy strategy-1: Missing Credentials, Strategy strategy-2: Missing Credentials');
});

test('succeed if all succeed', async (t) => {
  const server = await setupAll([true, true, true, true]);
  const { statusCode, result } = await request(server);

  t.log(result);
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

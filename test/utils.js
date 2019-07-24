const hapi = require('@hapi/hapi');
const boom = require('@hapi/boom');
const anyAuth = require('../');

const request = server => server.inject({
  url: '/',
  headers: { authorization: 'Bearer Something' },
});

const authenticate = succeed => (_, h) => {
  if (succeed) {
    return h.authenticated({ credentials: { scope: [] } });
  }
  return boom.unauthorized('Missing Credentials');
};

const setupStrategies = (server, strategies) => {
  const names = strategies.map((succeed, index) => {
    const name = `strategy-${index}`;
    server.auth.strategy(name, 'test', { succeed });
    return name;
  });

  server.auth.strategy('any', 'any', { strategies: names });
  server.auth.default('any');
};

const setupServerAndPlugin = async () => {
  const server = hapi.server();
  await server.initialize();
  server.register(anyAuth);

  server.route({
    method: 'GET',
    path: '/',
    options: {
      handler(_, h) {
        return h.response();
      },
    },
  });

  server.auth.scheme('test', (_, { succeed }) => ({ authenticate: authenticate(succeed) }));

  return server;
};

const setupAll = async (strategies) => {
  const server = await setupServerAndPlugin();
  await setupStrategies(server, strategies);
  return server;
};

module.exports = {
  setup: setupAll,
  setupServerAndPlugin,
  request,
};

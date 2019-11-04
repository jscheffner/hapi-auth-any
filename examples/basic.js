const hapi = require('@hapi/hapi');
const anyAuth = require('hapi-auth-any');
const basic = require('@hapi/basic');

const init = async () => {
  const server = hapi.server();
  await server.initialize();

  await server.register([
    anyAuth,
    basic,
  ]);

  server.auth.strategy('simple', 'basic', { /* content omitted */ });
  server.auth.strategy('not-so-simple', 'basic', { /* content omitted */ });

  server.auth.strategy('any', 'any', {
    strategies: ['simple', 'not-so-simple'],
  });
  server.auth.default('any');
};

init();

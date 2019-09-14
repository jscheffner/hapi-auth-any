const boom = require('@hapi/boom');
const pAny = require('p-any');

const pkg = require('./package');

const to = promise => promise
  .then(data => [null, data])
  .catch(err => [err, null]);

const test = (server, request) => async (strategy) => {
  const [error, auth] = await to(server.auth.test(strategy, request));

  if (error) {
    throw new Error(`Strategy ${strategy}: ${error.message}`);
  }

  return auth;
};

const authenticate = (server, strategies) => async (request, h) => {
  const [errors, auth] = await to(pAny(strategies.map(test(server, request))));

  if (errors) {
    throw boom.unauthorized([...errors].map(({ message }) => message).join(', '));
  }

  return h.authenticated(auth);
};

const register = (server, { name = 'any' }) => {
  const scheme = (_, { strategies }) => ({ authenticate: authenticate(server, strategies) });
  server.auth.scheme(name, scheme);
};

module.exports = {
  register,
  pkg,
};

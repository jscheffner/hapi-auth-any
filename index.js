const boom = require('@hapi/boom');
const pAny = require('p-any');
const pkg = require('./package');

const test = async (server, strategy, request) => {
  try {
    return await server.auth.test(strategy, request);
  } catch (err) {
    throw new Error(`Strategy ${strategy}: ${err.message}`);
  }
};

const authenticate = (server, strategies) => async (request, h) => {
  try {
    const auth = await pAny(strategies.map(strategy => test(server, strategy, request)));
    return h.authenticated(auth);
  } catch (errors) {
    return boom.unauthorized([...errors].map(({ message }) => message).join(', '));
  }
};

const register = (server, { name = 'any' }) => {
  const scheme = (_, { strategies }) => ({ authenticate: authenticate(server, strategies) });
  server.auth.scheme(name, scheme);
};

module.exports = {
  register,
  pkg,
};

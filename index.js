const boom = require('@hapi/boom')

const pkg = require('./package.json')

const to = (promise) => promise
  .then((data) => [null, data])
  .catch((err) => [err, null])

const test = (server, request) => async (strategy) => {
  const [error, auth] = await to(server.auth.test(strategy, request))

  if (error) {
    const preparedError = boom.boomify(error, { decorate: { strategy } })
    preparedError.message = `Strategy ${strategy}: ${preparedError.message}`
    preparedError.output.payload.message = `Strategy ${strategy}: ${preparedError.output.payload.message}`
    throw preparedError
  }

  return auth
}

const authenticate = (server, strategies) => async (request, h) => {
  const [aggregateError, auth] = await to(Promise.any(strategies.map(test(server, request))))

  if (aggregateError) {
    const preparedAggregateError = boom.boomify(aggregateError, { statusCode: 401 })
    preparedAggregateError.output.payload.message = aggregateError.errors.map(({ output }) => output.payload.message).join(', ')
    throw preparedAggregateError
  }

  return h.authenticated(auth)
}

const register = (server, { name = 'any' }) => {
  const scheme = (_, { strategies }) => ({ authenticate: authenticate(server, strategies) })
  server.auth.scheme(name, scheme)
}

module.exports = {
  register,
  pkg,
}

const { isBoom } = require('@hapi/boom')
const test = require('node:test')
const { strict: assert } = require('node:assert')

const { setup: setupAll, setupServerAndPlugin, request } = require('./utils')

test('fail if all fail', async () => {
  const server = await setupAll([false, false, false])
  const { statusCode, result } = await request(server)

  assert.equal(statusCode, 401)
  assert.equal(result.message, 'Strategy strategy-0: Missing Credentials, Strategy strategy-1: Missing Credentials, Strategy strategy-2: Missing Credentials')
})

test('provide causes of failing strategies', async () => {
  const server = await setupAll([false, false, false, false])
  const listener = new Promise((resolve) => {
    server.events.on({ name: 'request', channels: 'internal' }, (req, event) => {
      resolve(event.error)
    })
  })

  request(server)
  const aggregateError = await listener

  assert.equal(true, aggregateError instanceof AggregateError)
  assert.equal(true, isBoom(aggregateError))
  assert.equal(aggregateError.errors.length, 4)
  aggregateError.errors.forEach((err) => assert.equal(true, isBoom(err), `${err.strategy} should result in a boom error.`))
})

test('succeed if all succeed', async () => {
  const server = await setupAll([true, true, true, true])
  const { statusCode } = await request(server)

  assert.equal(statusCode, 200)
})

test('succeed if one succeeds', async () => {
  const server = await setupAll([false, false, false, true, false, false])
  const { statusCode } = await request(server)

  assert.equal(statusCode, 200)
})

test('succeed if some succeeds', async () => {
  const server = await setupAll([false, true, false, true, false, true])
  const { statusCode } = await request(server)

  assert.equal(statusCode, 200)
})

test('do not expose message of server errors', async () => {
  const server = await setupServerAndPlugin()
  server.auth.scheme('error', () => ({ authenticate: () => { throw new Error('Test Error') } }))
  server.auth.strategy('error', 'error')
  server.auth.strategy('any', 'any', { strategies: ['error'] })
  server.auth.default('any')

  const { statusCode, result } = await request(server)
  assert.equal(statusCode, 401)
  assert.deepEqual(result, {
    error: 'Unauthorized',
    message: 'Strategy error: An internal server error occurred',
    statusCode: 401,
  })
})

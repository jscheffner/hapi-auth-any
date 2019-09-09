/**
 * Example of how to use hapi-auth-any to wrap [hapi-auth-keycloak](https://github.com/felixheck/hapi-auth-keycloak), so it is configurable with multiple realmURLs
 * 
 * It accepts all the options that `hapi-auth-keycloak` does, plus a `realms` option.
 * 
 * Example:
 * 
 * ```javaScript
 * {
 *   realms: [
 *     {
 *       name: 'foo',
 *       url: 'https://example.com/auth/realms/foo'  
 *     },
 *     {
 *       name: 'bar',
 *       url: 'https://example.com/auth/realms/bar'  
 *     }
 *   ],
 *   clientId: 'foobar'
 * }
 * ```
 */

const hapiKeycloak = require('hapi-auth-keycloak')
const anyAuth = require('hapi-auth-any')

const register = async (server, opts) => {
  const { realms, ...hapiKeycloakOptions } = opts

  await server.register([
    {
      plugin: hapiKeycloak,
      options: hapiKeycloakOptions
    },
    anyAuth
  ])

  const strategies = realms.map(({ name, url }) => {
    server.auth.strategy(name, 'keycloak-jwt', { name, realmUrl: url })
    return name
  })

  server.auth.strategy('keycloak', 'any', { strategies })
  server.auth.default('keycloak')
}

module.exports = {
  register,
  name: 'auth'
}

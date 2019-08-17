# hapi-auth-any

**hapi-auth-any** is a plugin for hapi.js which lets you combine multiple different strategies. It passes if one of them does. Hapi already supports this out-of-the-box, but only if each of those strategies are based on different schemes. With *hapi-auth-any* you can combine various strategies that are based on the same scheme.

**Only the credentials of the strategy that passes first are returned.**

## Usage

Install it with `npm install hapi-auth-any`

Then you can use it:

```javaScript
const hapi = require('@hapi/hapi');
const anyAuth = require('hapi-auth-any');
// example auth plugin:
const basic = require('@hapi/basic')
// example config module for the example plugin:
const config = require('./config');

const init = async () => {
  const server = hapi.server();
  await server.initialize();
  
  // register hapi-auth-any and the other plugins you want to use:
  await server.register([
    anyAuth,
    basic
  ]);
  
  // register the strategies you want to combine
  server.auth.strategy('simple', 'basic', config.simple);
  server.auth.strategy('not-so-simple', 'basic', config.notSoSimple);
  
  // register the strategy with the `any` scheme, pass the names of the strategies you want to combine as the `strategy` option
  server.auth.strategy('any', 'any', {
    strategies: ['simple', 'not-so-simple'] 
  });
  server.auth.default('any');
}

init()
// => Now, a user can access any route if at least of of the two strategies, simple or not-so-simple, succeeds
```

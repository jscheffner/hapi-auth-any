[![Build Status](https://travis-ci.com/jscheffner/hapi-auth-any.svg?branch=master)](https://travis-ci.com/jscheffner/hapi-auth-any) [![Coverage Status](https://coveralls.io/repos/github/jscheffner/hapi-auth-any/badge.svg?branch=master)](https://coveralls.io/github/jscheffner/hapi-auth-any?branch=master)

# hapi-auth-any

**hapi-auth-any** is a plugin for [hapi.js](https://hapijs.com/) which lets you combine multiple different authentication strategies. It passes if one of them does. Hapi already supports this out-of-the-box, but only if all of those strategies are based on different schemes. With *hapi-auth-any* you can combine various strategies that are based on the same scheme.

**Only the credentials of the strategy that passes first are returned.**

## Plugin Options

The plugin only accepts a single option at the moment. `strategies` is an array containing the names of the strategies to combine. Those names are the first argument passed to `server.auth.strategy` when registering the strategy.

## Usage

For complete examples, have a look at the *examples* folder.

#### 1. Install

Install the plugin with `npm install hapi-auth-any`.

#### 2. Import

Import `hapi-auth-any` and the plugins you need for the authentication strategies that you want to combine (in this example only `@hapi/basic`).

```js
const authAny = require('hapi-auth-any');
const basic = require('@hapi/basic');
```

Then, create a Hapi server:

```js
const hapi = require('@hapi/hapi');

const server = hapi.server({ port: 8080 });
```

#### 3. Register

Now, register the plugins

```js
await server.register([
  anyAuth,
  basic
]);
````

Register the authentication strategies you want to combine.

```js
server.auth.strategy('foo', 'basic', {...});
server.auth.strategy('bar', 'basic', {...});
```

Finally, register the `hapi-auth-any` strategy and pass the names of the strategies it should combine as its `strategies` option. You can set the strategy as the default strategy so it's used for all routes or set it per route.

```js
server.auth.strategy('any', 'any', {
  strategies: ['foo', 'bar'] 
});

server.auth.default('any');
```

## Debugging

Sometimes, the messages exposed to the end users are not enough to find the root of a problem, specifically if a strategy fails because of a server-side error.

To access the complete errors, including their stack, you can register an event listener:

```js
  server.events.on({ name: 'request', channels: 'internal' }, (request, event, tags) => {
    if (tags.auth && tags.error) {
      console.log(event.error);
    }
  });
```

In this, debugging `hapi-auth-any` isn't different from debugging other strategies. However, in order to preserve the errors that caused `hapi-auth-any` to fail, it throws an [AggregateError](https://github.com/sindresorhus/aggregate-error), decorated with some [boom](https://github.com/hapijs/boom)-specific properties. `AggregateErrors` are iterable, which is how you can access the individual errors.
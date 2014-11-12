![boom Logo](https://raw.github.com/hapijs/boom/master/images/boom.png)

HTTP-friendly error objects

[![Build Status](https://secure.travis-ci.org/hapijs/boom.png)](http://travis-ci.org/hapijs/boom)

Lead Maintainer: [Adam Bretz](https://github.com/arb)

**boom** provides a set of utilities for returning HTTP errors. Each utility returns a `Boom` error response
object (instance of `Error`) which includes the following properties:
- `isBoom` - if `true`, indicates this is a `Boom` object instance.
- `message` - the error message.
- `output` - the formatted response. Can be directly manipulated after object construction to return a custom
  error response. Allowed root keys:
    - `statusCode` - the HTTP status code (typically 4xx or 5xx).
    - `headers` - an object containing any HTTP headers where each key is a header name and value is the header content.
    - `payload` - the formatted object used as the response payload (stringified). Can be directly manipulated but any
      changes will be lost
      if `reformat()` is called. Any content allowed and by default includes the following content:
        - `statusCode` - the HTTP status code, derived from `error.output.statusCode`.
        - `error` - the HTTP status message (e.g. 'Bad Request', 'Internal Server Error') derived from `statusCode`.
        - `message` - the error message derived from `error.message`.
- inherited `Error` properties.

The `Boom` object also supports the following method:
- `reformat()` - rebuilds `error.output` using the other object properties.

## Helper Methods

### `wrap(error, [statusCode], [message])`

Decorates an error with the **boom** properties where:
- `error` - the error object to wrap. If `error` is already a **boom** object, returns back the same object.
- `statusCode` - optional HTTP status code. Defaults to `500`.
- `message` - optional message string. If the error already has a message, it addes the message as a prefix.
  Defaults to no message.

```js
var error = new Error('Unexpected input');
Boom.wrap(error, 400);
```

### `create(statusCode, [message], [data])`

Generates an `Error` object with the **boom** decorations where:
- `statusCode` - an HTTP error code number. Must be greater or equal 400.
- `message` - optional message string.
- `data` - additional error data set to `error.data` property.

```js
var error = Boom.create(400, 'Bad request', { timestamp: Date.now() });
```

## HTTP 4xx Errors

###Boom.badRequest
example payload for `Boom.badRequest('your message');`
```json
{
    "statusCode": 400,
    "error": "Bad Request",
    "message": "your message"
}
```

###Boom.unauthorized
example payload for `Boom.unauthorized('your message');`
```json
{
    "statusCode": 401,
    "error": "Unauthorized",
    "message": "your message"
}
```

###Boom.forbidden
example payload for `Boom.forbidden('your message');`
```json
{
    "statusCode": 403,
    "error": "Forbidden",
    "message": "your message"
}
```

###Boom.notFound
example payload for `Boom.notFound('your message');`
```json
{
    "statusCode": 404,
    "error": "Not Found",
    "message": "your message"
}
```

###Boom.methodNotAllowed
example payload for `Boom.methodNotAllowed('your message');`
```json
{
    "statusCode": 405,
    "error": "Method Not Allowed",
    "message": "your message"
}
```

###Boom.notAcceptable
example payload for `Boom.notAcceptable('your message');`
```json
{
    "statusCode": 406,
    "error": "Not Acceptable",
    "message": "your message"
}
```

###Boom.proxyAuthRequired
example payload for `Boom.proxyAuthRequired('your message');`
```json
{
    "statusCode": 407,
    "error": "Proxy Authentication Required",
    "message": "your message"
}
```

###Boom.clientTimeout
example payload for `Boom.clientTimeout('your message');`
```json
{
    "statusCode": 408,
    "error": "Request Time-out",
    "message": "your message"
}
```

###Boom.conflict
example payload for `Boom.conflict('your message');`
```json
{
    "statusCode": 409,
    "error": "Conflict",
    "message": "your message"
}
```

###Boom.resourceGone
example payload for `Boom.resourceGone('your message');`
```json
{
    "statusCode": 410,
    "error": "Gone",
    "message": "your message"
}
```

###Boom.lengthRequired
example payload for `Boom.lengthRequired('your message');`
```json
{
    "statusCode": 411,
    "error": "Length Required",
    "message": "your message"
}
```

###Boom.preconditionFailed
example payload for `Boom.preconditionFailed('your message');`
```json
{
    "statusCode": 412,
    "error": "Precondition Failed",
    "message": "your message"
}
```

###Boom.entityTooLarge
example payload for `Boom.entityTooLarge('your message');`
```json
{
    "statusCode": 413,
    "error": "Request Entity Too Large",
    "message": "your message"
}
```

###Boom.uriTooLong
example payload for `Boom.uriTooLong('your message');`
```json
{
    "statusCode": 414,
    "error": "Request-URI Too Large",
    "message": "your message"
}
```

###Boom.unsupportedMediaType
example payload for `Boom.unsupportedMediaType('your message');`
```json
{
    "statusCode": 415,
    "error": "Unsupported Media Type",
    "message": "your message"
}
```

###Boom.rangeNotSatisfiable
example payload for `Boom.rangeNotSatisfiable('your message');`
```json
{
    "statusCode": 416,
    "error": "Requested Range Not Satisfiable",
    "message": "your message"
}
```

###Boom.expectationFailed
example payload for `Boom.expectationFailed('your message');`
```json
{
    "statusCode": 417,
    "error": "Expectation Failed",
    "message": "your message"
}
```

###Boom.badData
example payload for `Boom.badData('your message');`
```json
{
    "statusCode": 422,
    "error": "Unprocessable Entity",
    "message": "your message"
}
```

###Boom.tooManyRequests
example payload for `Boom.tooManyRequests('your message');`
```json
{
    "statusCode": 429,
    "error": "Too Many Requests",
    "message": "your message"
}
```

## HTTP 5xx Errors

All 5xx errors hide your message from the end user. Your message is recorded in the server log.

###Boom.notImplemented
example payload for `Boom.notImplemented('your message');`
```json
{
    "statusCode": 501,
    "error": "Not Implemented",
    "message": "An internal server error occurred"
}
```

###Boom.badGateway
example payload for `Boom.badGateway('your message');`
```json
{
    "statusCode": 502,
    "error": "Bad Gateway",
    "message": "An internal server error occurred"
}
```

###Boom.serverTimeout
example payload for `Boom.serverTimeout('your message');`
```json
{
    "statusCode": 503,
    "error": "Service Unavailable",
    "message": "An internal server error occurred"
}
```

###Boom.gatewayTimeout
example payload for `Boom.gatewayTimeout('your message');`
```json
{
    "statusCode": 504,
    "error": "Gateway Time-out",
    "message": "An internal server error occurred"
}
```

###Boom.badImplementation
example payload for `Boom.badImplementation('your message');`
```json
{
    "statusCode": 500,
    "error": "Internal Server Error",
    "message": "An internal server error occurred"
}
```

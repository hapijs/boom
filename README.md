<a href="http://hapijs.com"><img src="https://raw.githubusercontent.com/hapijs/assets/master/images/family.png" width="180px" align="right" /></a>

# Boom

Turn JavaScript errors into HTTP-friendly errors.

[![Build Status](https://secure.travis-ci.org/hapijs/boom.svg)](http://travis-ci.org/hapijs/boom)

## Installation

```bash
npm install @hapi/boom
```

## Usage

Wrap any JavaScript error with the `boom.boomify()`.

```javascript
const boom = require('boom')

try {
  throw new Error('This is an error!')
} catch (err) {
  boom.boomify(err)
}
```

### With ExpressJS

You can raise pre-wrapped common exceptions directly.

```javascript
const boom = require('boom')

app.get('/users/:id', (req, res, next) => {
  if (!req.params.id) {
    return next(boom.badRequest('no id supplied'))
  }

  Users.get(req.params.id, (err, user) => {
    if (err) {
      return next(boom.badImplementation(err))
    }

    res.send(users)
  })
})
```

For a complete list of commands and exceptions, consult the [**API Reference**](API.md).

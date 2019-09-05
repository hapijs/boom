import { Boom } from '..';
import * as Lab from '@hapi/lab';

const { expect } = Lab.types;

const error = new Error('Unexpected input')

// new Boom()

expect.type<Boom>(new Boom());


// boomify()

expect.type<Boom>(new Boom().boomify(error, {statusCode: 400}));
expect.type<Boom>(new Boom().boomify(error, {statusCode: 400, message: 'Unexpected Input', override: false}));

expect.error(new Boom().boomify(error, {statusCode: '400'}));
expect.error(new Boom().boomify('error'));
expect.error(new Boom().boomify(error, {statusCode: 400, message: true}));
expect.error(new Boom().boomify(error, {statusCode: 400, override: 'false'}));
expect.error(new Boom().boomify());


// isBoom()

expect.type<boolean>(new Boom().isBoom(error));

expect.error(new Boom().isBoom('error'));
expect.error(new Boom().isBoom({ foo: 'bar' }));
expect.error(new Boom().isBoom({ error: true }));
expect.error(new Boom().isBoom());


// 4xx Errors

// badRequest()

expect.type<Boom>(new Boom().badRequest('invalid query'));
expect.type<Boom>(new Boom().badRequest());

expect.error(new Boom().badRequest(400));
expect.error(new Boom().badRequest({ foo: 'bar' }));


// unauthorized()

expect.type<Boom>(new Boom().unauthorized('invalid password'));
expect.type<Boom>(new Boom().unauthorized('invalid password', 'simple'));
expect.type<Boom>(new Boom().unauthorized(null, 'Negotiate', 'VGhpcyBpcyBhIHRlc3QgdG9rZW4='));
expect.type<Boom>(new Boom().unauthorized('invalid password', 'sample', { ttl: 0, cache: null, foo: 'bar' }));
expect.type<Boom>(new Boom().unauthorized());

expect.error(new Boom().unauthorized(401))
expect.error(new Boom().unauthorized('invalid password', 500))
expect.error(new Boom().unauthorized('invalid password', 'sample', 500))


// paymentRequired()

expect.type<Boom>(new Boom().paymentRequired('bandwidth used'));
expect.type<Boom>(new Boom().paymentRequired());

expect.error(new Boom().paymentRequired(402));
expect.error(new Boom().paymentRequired({ foo: 'bar' }));


// forbidden()

expect.type<Boom>(new Boom().forbidden('try again some time'));
expect.type<Boom>(new Boom().forbidden());

expect.error(new Boom().forbidden(403));
expect.error(new Boom().forbidden({ foo: 'bar' }));


// notFound()

expect.type<Boom>(new Boom().notFound('missing'));
expect.type<Boom>(new Boom().notFound());

expect.error(new Boom().notFound(404));
expect.error(new Boom().notFound({ foo: 'bar' }));
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

expect.type<Boom>(new Boom().badRequest('invalid query', 'some data'));
expect.type<Boom>(new Boom().badRequest('invalid query', { foo: 'bar' }));
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

expect.type<Boom>(new Boom().paymentRequired('bandwidth used', 'some data'));
expect.type<Boom>(new Boom().paymentRequired('bandwidth used', { foo: 'bar' }));
expect.type<Boom>(new Boom().paymentRequired('bandwidth used'));
expect.type<Boom>(new Boom().paymentRequired());

expect.error(new Boom().paymentRequired(402));
expect.error(new Boom().paymentRequired({ foo: 'bar' }));


// forbidden()

expect.type<Boom>(new Boom().forbidden('try again some time', 'some data'));
expect.type<Boom>(new Boom().forbidden('try again some time', { foo: 'bar' }));
expect.type<Boom>(new Boom().forbidden('try again some time'));
expect.type<Boom>(new Boom().forbidden());

expect.error(new Boom().forbidden(403));
expect.error(new Boom().forbidden({ foo: 'bar' }));


// notFound()

expect.type<Boom>(new Boom().notFound('missing', 'some data'));
expect.type<Boom>(new Boom().notFound('missing', { foo: 'bar' }));
expect.type<Boom>(new Boom().notFound('missing'));
expect.type<Boom>(new Boom().notFound());

expect.error(new Boom().notFound(404));
expect.error(new Boom().notFound({ foo: 'bar' }));


// methodNotAllowed()

expect.type<Boom>(new Boom().methodNotAllowed('this method is not allowed', 'some data'));
expect.type<Boom>(new Boom().methodNotAllowed('this method is not allowed', { foo: 'bar' }));
expect.type<Boom>(new Boom().methodNotAllowed('this method is not allowed'));
expect.type<Boom>(new Boom().methodNotAllowed());

expect.error(new Boom().methodNotAllowed(405));
expect.error(new Boom().methodNotAllowed({ foo: 'bar' }));


// notAcceptable()

expect.type<Boom>(new Boom().notAcceptable('unacceptable', 'some data'));
expect.type<Boom>(new Boom().notAcceptable('unacceptable', { foo: 'bar' }));
expect.type<Boom>(new Boom().notAcceptable('unacceptable'));
expect.type<Boom>(new Boom().notAcceptable());

expect.error(new Boom().notAcceptable(406));
expect.error(new Boom().notAcceptable({ foo: 'bar' }));


// proxyAuthRequired()

expect.type<Boom>(new Boom().proxyAuthRequired('auth missing', 'some data'));
expect.type<Boom>(new Boom().proxyAuthRequired('auth missing', { foo: 'bar' }));
expect.type<Boom>(new Boom().proxyAuthRequired('auth missing'));
expect.type<Boom>(new Boom().proxyAuthRequired());

expect.error(new Boom().proxyAuthRequired(407));
expect.error(new Boom().proxyAuthRequired({ foo: 'bar' }));


// clientTimeout()

expect.type<Boom>(new Boom().clientTimeout('timed out', 'some data'));
expect.type<Boom>(new Boom().clientTimeout('timed out', { foo: 'bar' }));
expect.type<Boom>(new Boom().clientTimeout('timed out'));
expect.type<Boom>(new Boom().clientTimeout());

expect.error(new Boom().clientTimeout(408));
expect.error(new Boom().clientTimeout({ foo: 'bar' }));


// conflict()

expect.type<Boom>(new Boom().conflict('there was a conflict', 'some data'));
expect.type<Boom>(new Boom().conflict('there was a conflict', { foo: 'bar' }));
expect.type<Boom>(new Boom().conflict('there was a conflict'));
expect.type<Boom>(new Boom().conflict());

expect.error(new Boom().conflict(409));
expect.error(new Boom().conflict({ foo: 'bar' }));


// resourceGone()

expect.type<Boom>(new Boom().resourceGone('it is gone', 'some data'));
expect.type<Boom>(new Boom().resourceGone('it is gone', { foo: 'bar' }));
expect.type<Boom>(new Boom().resourceGone('it is gone'));
expect.type<Boom>(new Boom().resourceGone());

expect.error(new Boom().resourceGone(410));
expect.error(new Boom().resourceGone({ foo: 'bar' }));


// lengthRequired()

expect.type<Boom>(new Boom().lengthRequired('length needed', 'some data'));
expect.type<Boom>(new Boom().lengthRequired('length needed', { foo: 'bar' }));
expect.type<Boom>(new Boom().lengthRequired('length needed'));
expect.type<Boom>(new Boom().lengthRequired());

expect.error(new Boom().lengthRequired(411));
expect.error(new Boom().lengthRequired({ foo: 'bar' }));


// preconditionFailed()

expect.type<Boom>(new Boom().preconditionFailed('failed', 'some data'));
expect.type<Boom>(new Boom().preconditionFailed('failed', { foo: 'bar' }));
expect.type<Boom>(new Boom().preconditionFailed('failed'));
expect.type<Boom>(new Boom().preconditionFailed());

expect.error(new Boom().preconditionFailed(412));
expect.error(new Boom().preconditionFailed({ foo: 'bar' }));


// entityTooLarge()

expect.type<Boom>(new Boom().entityTooLarge('too big', 'some data'));
expect.type<Boom>(new Boom().entityTooLarge('too big', { foo: 'bar' }));
expect.type<Boom>(new Boom().entityTooLarge('too big'));
expect.type<Boom>(new Boom().entityTooLarge());

expect.error(new Boom().entityTooLarge(413));
expect.error(new Boom().entityTooLarge({ foo: 'bar' }));


// uriTooLong()

expect.type<Boom>(new Boom().uriTooLong('uri is too long', 'some data'));
expect.type<Boom>(new Boom().uriTooLong('uri is too long', { foo: 'bar' }));
expect.type<Boom>(new Boom().uriTooLong('uri is too long'));
expect.type<Boom>(new Boom().uriTooLong());

expect.error(new Boom().uriTooLong(414));
expect.error(new Boom().uriTooLong({ foo: 'bar' }));


// unsupportedMediaType()

expect.type<Boom>(new Boom().unsupportedMediaType('that media is not supported', 'some data'));
expect.type<Boom>(new Boom().unsupportedMediaType('that media is not supported', { foo: 'bar' }));
expect.type<Boom>(new Boom().unsupportedMediaType('that media is not supported'));
expect.type<Boom>(new Boom().unsupportedMediaType());

expect.error(new Boom().unsupportedMediaType(415));
expect.error(new Boom().unsupportedMediaType({ foo: 'bar' }));


// rangeNotSatisfiable()

expect.type<Boom>(new Boom().rangeNotSatisfiable('range not satisfiable', 'some data'));
expect.type<Boom>(new Boom().rangeNotSatisfiable('range not satisfiable', { foo: 'bar' }));
expect.type<Boom>(new Boom().rangeNotSatisfiable('range not satisfiable'));
expect.type<Boom>(new Boom().rangeNotSatisfiable());

expect.error(new Boom().rangeNotSatisfiable(416));
expect.error(new Boom().rangeNotSatisfiable({ foo: 'bar' }));


// expectationFailed()

expect.type<Boom>(new Boom().expectationFailed('expected this to work', 'some data'));
expect.type<Boom>(new Boom().expectationFailed('expected this to work', { foo: 'bar' }));
expect.type<Boom>(new Boom().expectationFailed('expected this to work'));
expect.type<Boom>(new Boom().expectationFailed());

expect.error(new Boom().expectationFailed(417));
expect.error(new Boom().expectationFailed({ foo: 'bar' }));


// teapot()

expect.type<Boom>(new Boom().teapot('sorry, no coffee...', 'some data'));
expect.type<Boom>(new Boom().teapot('sorry, no coffee...', { foo: 'bar' }));
expect.type<Boom>(new Boom().teapot('sorry, no coffee...'));
expect.type<Boom>(new Boom().teapot());

expect.error(new Boom().teapot(418));
expect.error(new Boom().teapot({ foo: 'bar' }));


// badData()

expect.type<Boom>(new Boom().badData('your data is bad and you should feel bad', 'some data'));
expect.type<Boom>(new Boom().badData('your data is bad and you should feel bad', { foo: 'bar' }));
expect.type<Boom>(new Boom().badData('your data is bad and you should feel bad'));
expect.type<Boom>(new Boom().badData());

expect.error(new Boom().badData(422));
expect.error(new Boom().badData({ foo: 'bar' }));


// locked()

expect.type<Boom>(new Boom().locked('this resource has been locked', 'some data'));
expect.type<Boom>(new Boom().locked('this resource has been locked', { foo: 'bar' }));
expect.type<Boom>(new Boom().locked('this resource has been locked'));
expect.type<Boom>(new Boom().locked());

expect.error(new Boom().locked(423));
expect.error(new Boom().locked({ foo: 'bar' }));


// failedDependency()

expect.type<Boom>(new Boom().failedDependency('an external resource failed', 'some data'));
expect.type<Boom>(new Boom().failedDependency('an external resource failed', { foo: 'bar' }));
expect.type<Boom>(new Boom().failedDependency('an external resource failed'));
expect.type<Boom>(new Boom().failedDependency());

expect.error(new Boom().failedDependency(424));
expect.error(new Boom().failedDependency({ foo: 'bar' }));


// preconditionRequired()

expect.type<Boom>(new Boom().preconditionRequired('you must supple an If-Match header', 'some data'));
expect.type<Boom>(new Boom().preconditionRequired('you must supple an If-Match header', { foo: 'bar' }));
expect.type<Boom>(new Boom().preconditionRequired('you must supple an If-Match header'));
expect.type<Boom>(new Boom().preconditionRequired());

expect.error(new Boom().preconditionRequired(428));
expect.error(new Boom().preconditionRequired({ foo: 'bar' }));


// tooManyRequests()

expect.type<Boom>(new Boom().tooManyRequests('you have exceeded your request limit', 'some data'));
expect.type<Boom>(new Boom().tooManyRequests('you have exceeded your request limit', { foo: 'bar' }));
expect.type<Boom>(new Boom().tooManyRequests('you have exceeded your request limit'));
expect.type<Boom>(new Boom().tooManyRequests());

expect.error(new Boom().tooManyRequests(414));
expect.error(new Boom().tooManyRequests({ foo: 'bar' }));


// illegal()

expect.type<Boom>(new Boom().illegal('you are not permitted to view this resource for legal reasons', 'some data'));
expect.type<Boom>(new Boom().illegal('you are not permitted to view this resource for legal reasons', { foo: 'bar' }));
expect.type<Boom>(new Boom().illegal('you are not permitted to view this resource for legal reasons'));
expect.type<Boom>(new Boom().illegal());

expect.error(new Boom().illegal(451));
expect.error(new Boom().illegal({ foo: 'bar' }));


// 5xx Errors

// badImplementation()

expect.type<Boom>(new Boom().badImplementation('terrible implementation', 'some data'));
expect.type<Boom>(new Boom().badImplementation('terrible implementation', { foo: 'bar' }));
expect.type<Boom>(new Boom().badImplementation('terrible implementation'));
expect.type<Boom>(new Boom().badImplementation());

expect.error(new Boom().badImplementation(500));
expect.error(new Boom().badImplementation({ foo: 'bar' }));


// notImplemented()

expect.type<Boom>(new Boom().notImplemented('method not implemented', 'some data'));
expect.type<Boom>(new Boom().notImplemented('method not implemented', { foo: 'bar' }));
expect.type<Boom>(new Boom().notImplemented('method not implemented'));
expect.type<Boom>(new Boom().notImplemented());

expect.error(new Boom().notImplemented(501));
expect.error(new Boom().notImplemented({ foo: 'bar' }));


// badGateway()

expect.type<Boom>(new Boom().badGateway('this is a bad gateway', 'some data'));
expect.type<Boom>(new Boom().badGateway('this is a bad gateway', { foo: 'bar' }));
expect.type<Boom>(new Boom().badGateway('this is a bad gateway'));
expect.type<Boom>(new Boom().badGateway());

expect.error(new Boom().badGateway(502));
expect.error(new Boom().badGateway({ foo: 'bar' }));


// serverUnavailable()

expect.type<Boom>(new Boom().serviceUnavailable('unavailable', 'some data'));
expect.type<Boom>(new Boom().serviceUnavailable('unavailable', { foo: 'bar' }));
expect.type<Boom>(new Boom().serviceUnavailable('unavailable'));
expect.type<Boom>(new Boom().serviceUnavailable());

expect.error(new Boom().serviceUnavailable(503));
expect.error(new Boom().serviceUnavailable({ foo: 'bar' }));


// gatewayTimeout()

expect.type<Boom>(new Boom().gatewayTimeout('gateway timeout', 'some data'));
expect.type<Boom>(new Boom().gatewayTimeout('gateway timeout', { foo: 'bar' }));
expect.type<Boom>(new Boom().gatewayTimeout('gateway timeout'));
expect.type<Boom>(new Boom().gatewayTimeout());

expect.error(new Boom().gatewayTimeout(504));
expect.error(new Boom().gatewayTimeout({ foo: 'bar' }));
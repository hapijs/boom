import * as Boom from '..';
import * as Lab from '@hapi/lab';

const { expect } = Lab.types;


class X {

    x: number;

    constructor(value: number) {

        this.x = value;
    }
};

const decorate = new X(1);


// new Boom.Boom()

expect.type<Boom.Boom>(new Boom.Boom());
expect.type<Error>(new Boom.Boom());
expect.type<Boom.Boom>(new Boom.Boom('error'));

expect.error(new Boom.Boom('error', { decorate }));     // No support for decoration on constructor


class CustomError extends Boom.Boom {}
expect.type<Boom.Boom>(new CustomError('Some error'));


const boom = new Boom.Boom('some error');
expect.type<Boom.Output>(boom.output);
expect.type<Boom.Payload>(boom.output.payload);


// boomify()

const error = new Error('Unexpected input');

expect.type<Boom.Boom>(Boom.boomify(error, { statusCode: 400 }));
expect.type<Boom.Boom>(Boom.boomify(error, { statusCode: 400, message: 'Unexpected Input', override: false }));
expect.type<number>(Boom.boomify(error, { decorate }).x);

expect.error(Boom.boomify(error, { statusCode: '400' }));
expect.error(Boom.boomify('error'));
expect.error(Boom.boomify(error, { statusCode: 400, message: true }));
expect.error(Boom.boomify(error, { statusCode: 400, override: 'false' }));
expect.error(Boom.boomify());
expect.error(Boom.boomify(error, { decorate }).y);


// isBoom

expect.type<boolean>(Boom.boomify(error).isBoom);

// isBoom()

expect.type<boolean>(Boom.isBoom(error));
expect.type<boolean>(Boom.isBoom(error, 404));
expect.type<boolean>(Boom.isBoom(Boom.boomify(error)));

expect.error(Boom.isBoom(error, 'test'));
expect.error(Boom.isBoom('error'));
expect.error(Boom.isBoom({ foo: 'bar' }));
expect.error(Boom.isBoom({ error: true }));
expect.error(Boom.isBoom());


// 4xx Errors

// badRequest()

expect.type<Boom.Boom>(Boom.badRequest('invalid query', 'some data'));
expect.type<Boom.Boom>(Boom.badRequest('invalid query', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.badRequest('invalid query'));
expect.type<Boom.Boom>(Boom.badRequest());

expect.error(Boom.badRequest(400));
expect.error(Boom.badRequest({ foo: 'bar' }));


// unauthorized()

expect.type<Boom.Boom>(Boom.unauthorized('invalid password'));
expect.type<Boom.Boom>(Boom.unauthorized('invalid password', 'simple'));
expect.type<Boom.Boom>(Boom.unauthorized(null, 'Negotiate', 'VGhpcyBpcyBhIHRlc3QgdG9rZW4='));
expect.type<Boom.Boom>(Boom.unauthorized('invalid password', 'sample', { ttl: 0, cache: null, foo: 'bar' }));
expect.type<Boom.Boom>(Boom.unauthorized('invalid password', 'sample', { ttl: 0, cache: null, foo: 'bar' } as Boom.unauthorized.Attributes));
expect.type<Boom.Boom>(Boom.unauthorized());
expect.type<Boom.Boom>(Boom.unauthorized('basic', ['a', 'b', 'c']));
expect.type<Boom.Boom & Boom.unauthorized.MissingAuth>(Boom.unauthorized('', 'basic'));
expect.type<Boom.Boom & Boom.unauthorized.MissingAuth>(Boom.unauthorized(null, 'basic'));
expect.type<boolean>(Boom.unauthorized('', 'basic').isMissing);
expect.type<boolean>(Boom.unauthorized(null, 'basic').isMissing);

expect.error(Boom.unauthorized(401))
expect.error(Boom.unauthorized('invalid password', 500))
expect.error(Boom.unauthorized('invalid password', 'sample', 500))
expect.error(Boom.unauthorized('basic', ['a', 'b', 'c'], 'test'));
expect.error(Boom.unauthorized('message', 'basic').isMissing);


// paymentRequired()

expect.type<Boom.Boom>(Boom.paymentRequired('bandwidth used', 'some data'));
expect.type<Boom.Boom>(Boom.paymentRequired('bandwidth used', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.paymentRequired('bandwidth used'));
expect.type<Boom.Boom>(Boom.paymentRequired());

expect.error(Boom.paymentRequired(402));
expect.error(Boom.paymentRequired({ foo: 'bar' }));


// forbidden()

expect.type<Boom.Boom>(Boom.forbidden('try again some time', 'some data'));
expect.type<Boom.Boom>(Boom.forbidden('try again some time', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.forbidden('try again some time'));
expect.type<Boom.Boom>(Boom.forbidden());

expect.error(Boom.forbidden(403));
expect.error(Boom.forbidden({ foo: 'bar' }));


// notFound()

expect.type<Boom.Boom>(Boom.notFound('missing', 'some data'));
expect.type<Boom.Boom>(Boom.notFound('missing', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.notFound('missing'));
expect.type<Boom.Boom>(Boom.notFound());

expect.error(Boom.notFound(404));
expect.error(Boom.notFound({ foo: 'bar' }));


// methodNotAllowed()

expect.type<Boom.Boom>(Boom.methodNotAllowed('this method is not allowed', 'some data'));
expect.type<Boom.Boom>(Boom.methodNotAllowed('this method is not allowed', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.methodNotAllowed('this method is not allowed'));
expect.type<Boom.Boom>(Boom.methodNotAllowed());

expect.error(Boom.methodNotAllowed(405));
expect.error(Boom.methodNotAllowed({ foo: 'bar' }));


// notAcceptable()

expect.type<Boom.Boom>(Boom.notAcceptable('unacceptable', 'some data'));
expect.type<Boom.Boom>(Boom.notAcceptable('unacceptable', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.notAcceptable('unacceptable'));
expect.type<Boom.Boom>(Boom.notAcceptable());

expect.error(Boom.notAcceptable(406));
expect.error(Boom.notAcceptable({ foo: 'bar' }));


// proxyAuthRequired()

expect.type<Boom.Boom>(Boom.proxyAuthRequired('auth missing', 'some data'));
expect.type<Boom.Boom>(Boom.proxyAuthRequired('auth missing', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.proxyAuthRequired('auth missing'));
expect.type<Boom.Boom>(Boom.proxyAuthRequired());

expect.error(Boom.proxyAuthRequired(407));
expect.error(Boom.proxyAuthRequired({ foo: 'bar' }));


// clientTimeout()

expect.type<Boom.Boom>(Boom.clientTimeout('timed out', 'some data'));
expect.type<Boom.Boom>(Boom.clientTimeout('timed out', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.clientTimeout('timed out'));
expect.type<Boom.Boom>(Boom.clientTimeout());

expect.error(Boom.clientTimeout(408));
expect.error(Boom.clientTimeout({ foo: 'bar' }));


// conflict()

expect.type<Boom.Boom>(Boom.conflict('there was a conflict', 'some data'));
expect.type<Boom.Boom>(Boom.conflict('there was a conflict', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.conflict('there was a conflict'));
expect.type<Boom.Boom>(Boom.conflict());

expect.error(Boom.conflict(409));
expect.error(Boom.conflict({ foo: 'bar' }));


// resourceGone()

expect.type<Boom.Boom>(Boom.resourceGone('it is gone', 'some data'));
expect.type<Boom.Boom>(Boom.resourceGone('it is gone', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.resourceGone('it is gone'));
expect.type<Boom.Boom>(Boom.resourceGone());

expect.error(Boom.resourceGone(410));
expect.error(Boom.resourceGone({ foo: 'bar' }));


// lengthRequired()

expect.type<Boom.Boom>(Boom.lengthRequired('length needed', 'some data'));
expect.type<Boom.Boom>(Boom.lengthRequired('length needed', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.lengthRequired('length needed'));
expect.type<Boom.Boom>(Boom.lengthRequired());

expect.error(Boom.lengthRequired(411));
expect.error(Boom.lengthRequired({ foo: 'bar' }));


// preconditionFailed()

expect.type<Boom.Boom>(Boom.preconditionFailed('failed', 'some data'));
expect.type<Boom.Boom>(Boom.preconditionFailed('failed', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.preconditionFailed('failed'));
expect.type<Boom.Boom>(Boom.preconditionFailed());

expect.error(Boom.preconditionFailed(412));
expect.error(Boom.preconditionFailed({ foo: 'bar' }));


// entityTooLarge()

expect.type<Boom.Boom>(Boom.entityTooLarge('too big', 'some data'));
expect.type<Boom.Boom>(Boom.entityTooLarge('too big', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.entityTooLarge('too big'));
expect.type<Boom.Boom>(Boom.entityTooLarge());

expect.error(Boom.entityTooLarge(413));
expect.error(Boom.entityTooLarge({ foo: 'bar' }));


// uriTooLong()

expect.type<Boom.Boom>(Boom.uriTooLong('uri is too long', 'some data'));
expect.type<Boom.Boom>(Boom.uriTooLong('uri is too long', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.uriTooLong('uri is too long'));
expect.type<Boom.Boom>(Boom.uriTooLong());

expect.error(Boom.uriTooLong(414));
expect.error(Boom.uriTooLong({ foo: 'bar' }));


// unsupportedMediaType()

expect.type<Boom.Boom>(Boom.unsupportedMediaType('that media is not supported', 'some data'));
expect.type<Boom.Boom>(Boom.unsupportedMediaType('that media is not supported', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.unsupportedMediaType('that media is not supported'));
expect.type<Boom.Boom>(Boom.unsupportedMediaType());

expect.error(Boom.unsupportedMediaType(415));
expect.error(Boom.unsupportedMediaType({ foo: 'bar' }));


// rangeNotSatisfiable()

expect.type<Boom.Boom>(Boom.rangeNotSatisfiable('range not satisfiable', 'some data'));
expect.type<Boom.Boom>(Boom.rangeNotSatisfiable('range not satisfiable', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.rangeNotSatisfiable('range not satisfiable'));
expect.type<Boom.Boom>(Boom.rangeNotSatisfiable());

expect.error(Boom.rangeNotSatisfiable(416));
expect.error(Boom.rangeNotSatisfiable({ foo: 'bar' }));


// expectationFailed()

expect.type<Boom.Boom>(Boom.expectationFailed('expected this to work', 'some data'));
expect.type<Boom.Boom>(Boom.expectationFailed('expected this to work', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.expectationFailed('expected this to work'));
expect.type<Boom.Boom>(Boom.expectationFailed());

expect.error(Boom.expectationFailed(417));
expect.error(Boom.expectationFailed({ foo: 'bar' }));


// teapot()

expect.type<Boom.Boom>(Boom.teapot('sorry, no coffee...', 'some data'));
expect.type<Boom.Boom>(Boom.teapot('sorry, no coffee...', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.teapot('sorry, no coffee...'));
expect.type<Boom.Boom>(Boom.teapot());

expect.error(Boom.teapot(418));
expect.error(Boom.teapot({ foo: 'bar' }));


// badData()

expect.type<Boom.Boom>(Boom.badData('your data is bad and you should feel bad', 'some data'));
expect.type<Boom.Boom>(Boom.badData('your data is bad and you should feel bad', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.badData('your data is bad and you should feel bad'));
expect.type<Boom.Boom>(Boom.badData());

expect.error(Boom.badData(422));
expect.error(Boom.badData({ foo: 'bar' }));


// locked()

expect.type<Boom.Boom>(Boom.locked('this resource has been locked', 'some data'));
expect.type<Boom.Boom>(Boom.locked('this resource has been locked', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.locked('this resource has been locked'));
expect.type<Boom.Boom>(Boom.locked());

expect.error(Boom.locked(423));
expect.error(Boom.locked({ foo: 'bar' }));


// failedDependency()

expect.type<Boom.Boom>(Boom.failedDependency('an external resource failed', 'some data'));
expect.type<Boom.Boom>(Boom.failedDependency('an external resource failed', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.failedDependency('an external resource failed'));
expect.type<Boom.Boom>(Boom.failedDependency());

expect.error(Boom.failedDependency(424));
expect.error(Boom.failedDependency({ foo: 'bar' }));

// tooEarly()

expect.type<Boom.Boom>(Boom.tooEarly('won\'t process your request', 'some data'));
expect.type<Boom.Boom>(Boom.tooEarly('won\'t process your request', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.tooEarly('won\'t process your request'));
expect.type<Boom.Boom>(Boom.tooEarly());

expect.error(Boom.tooEarly(425));
expect.error(Boom.tooEarly({ foo: 'bar' }));

// preconditionRequired()

expect.type<Boom.Boom>(Boom.preconditionRequired('you must supple an If-Match header', 'some data'));
expect.type<Boom.Boom>(Boom.preconditionRequired('you must supple an If-Match header', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.preconditionRequired('you must supple an If-Match header'));
expect.type<Boom.Boom>(Boom.preconditionRequired());

expect.error(Boom.preconditionRequired(428));
expect.error(Boom.preconditionRequired({ foo: 'bar' }));


// tooManyRequests()

expect.type<Boom.Boom>(Boom.tooManyRequests('you have exceeded your request limit', 'some data'));
expect.type<Boom.Boom>(Boom.tooManyRequests('you have exceeded your request limit', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.tooManyRequests('you have exceeded your request limit'));
expect.type<Boom.Boom>(Boom.tooManyRequests());

expect.error(Boom.tooManyRequests(414));
expect.error(Boom.tooManyRequests({ foo: 'bar' }));


// illegal()

expect.type<Boom.Boom>(Boom.illegal('you are not permitted to view this resource for legal reasons', 'some data'));
expect.type<Boom.Boom>(Boom.illegal('you are not permitted to view this resource for legal reasons', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.illegal('you are not permitted to view this resource for legal reasons'));
expect.type<Boom.Boom>(Boom.illegal());

expect.error(Boom.illegal(451));
expect.error(Boom.illegal({ foo: 'bar' }));


// 5xx Errors

// internal()

expect.type<Boom.Boom>(Boom.internal('terrible implementation', 'some data', 599));
expect.type<Boom.Boom>(Boom.internal('terrible implementation', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.internal('terrible implementation'));
expect.type<Boom.Boom>(Boom.internal());

expect.error(Boom.internal(500));
expect.error(Boom.internal({ foo: 'bar' }));


// badImplementation()

expect.type<Boom.Boom>(Boom.badImplementation('terrible implementation', 'some data'));
expect.type<Boom.Boom>(Boom.badImplementation('terrible implementation', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.badImplementation('terrible implementation'));
expect.type<Boom.Boom>(Boom.badImplementation());

expect.error(Boom.badImplementation(500));
expect.error(Boom.badImplementation({ foo: 'bar' }));


// notImplemented()

expect.type<Boom.Boom>(Boom.notImplemented('method not implemented', 'some data'));
expect.type<Boom.Boom>(Boom.notImplemented('method not implemented', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.notImplemented('method not implemented'));
expect.type<Boom.Boom>(Boom.notImplemented());

expect.error(Boom.notImplemented(501));
expect.error(Boom.notImplemented({ foo: 'bar' }));


// badGateway()

expect.type<Boom.Boom>(Boom.badGateway('this is a bad gateway', 'some data'));
expect.type<Boom.Boom>(Boom.badGateway('this is a bad gateway', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.badGateway('this is a bad gateway'));
expect.type<Boom.Boom>(Boom.badGateway());

expect.error(Boom.badGateway(502));
expect.error(Boom.badGateway({ foo: 'bar' }));


// serverUnavailable()

expect.type<Boom.Boom>(Boom.serverUnavailable('unavailable', 'some data'));
expect.type<Boom.Boom>(Boom.serverUnavailable('unavailable', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.serverUnavailable('unavailable'));
expect.type<Boom.Boom>(Boom.serverUnavailable());

expect.error(Boom.serverUnavailable(503));
expect.error(Boom.serverUnavailable({ foo: 'bar' }));


// gatewayTimeout()

expect.type<Boom.Boom>(Boom.gatewayTimeout('gateway timeout', 'some data'));
expect.type<Boom.Boom>(Boom.gatewayTimeout('gateway timeout', { foo: 'bar' }));
expect.type<Boom.Boom>(Boom.gatewayTimeout('gateway timeout'));
expect.type<Boom.Boom>(Boom.gatewayTimeout());

expect.error(Boom.gatewayTimeout(504));
expect.error(Boom.gatewayTimeout({ foo: 'bar' }));

'use strict';

const Boom = require('..');
const Code = require('@hapi/code');
const Lab = require('@hapi/lab');


const internals = {};


const { describe, it } = exports.lab = Lab.script();
const expect = Code.expect;


describe('Boom', () => {

    it('constructs error object (new)', () => {

        const err = new Boom.Boom('oops', { statusCode: 400 });
        expect(err.output.payload.message).to.equal('oops');
        expect(err.output.statusCode).to.equal(400);

        expect(Object.keys(err)).to.equal(['data', 'isBoom', 'isServer', 'output']);
        expect(JSON.stringify(err)).to.equal('{"data":null,"isBoom":true,"isServer":false,"output":{"statusCode":400,"payload":{"statusCode":400,"error":"Bad Request","message":"oops"},"headers":{}}}');
    });

    it('clones error object', () => {

        const oops = new Error('oops');
        const err = new Boom.Boom(oops, { statusCode: 400 });
        expect(err).to.not.shallow.equal(oops);
        expect(err.output.payload.message).to.equal('oops');
        expect(err.output.statusCode).to.equal(400);
    });

    it('decorates error', () => {

        const err = new Boom.Boom('oops', { statusCode: 400, decorate: { x: 1 } });
        expect(err.output.payload.message).to.equal('oops');
        expect(err.output.statusCode).to.equal(400);
        expect(err.x).to.equal(1);
    });

    it('handles missing message', () => {

        const err = new Error();
        Boom.boomify(err);

        expect(Boom.isBoom(err)).to.be.true();
    });

    it('handles missing message (class)', () => {

        const Example = class extends Error {

            constructor(message) {

                super(message);
                Boom.boomify(this);
            }
        };

        const err = new Example();
        expect(Boom.isBoom(err)).to.be.true();
    });

    it('throws when statusCode is not a number', () => {

        expect(() => {

            new Boom.Boom('message', { statusCode: 'x' });
        }).to.throw('First argument must be a number (400+): x');
    });

    it('errors on incompatible message property (prototype)', () => {

        const Err = class extends Error {

            get message() {

                return 'x';
            }
        };

        const err = new Err();
        expect(() => Boom.boomify(err, { message: 'override' })).to.throw('The error is not compatible with boom');
    });

    it('errors on incompatible message property (own)', () => {

        const err = new Error();
        Object.defineProperty(err, 'message', { get: function () { } });
        expect(() => Boom.boomify(err, { message: 'override' })).to.throw('The error is not compatible with boom');
    });

    it('will cast a number-string to an integer', () => {

        const codes = [
            { input: '404', result: 404 },
            { input: '404.1', result: 404 },
            { input: 400, result: 400 },
            { input: 400.123, result: 400 }
        ];

        for (let i = 0; i < codes.length; ++i) {
            const code = codes[i];
            const err = new Boom.Boom('', { statusCode: code.input });
            expect(err.output.statusCode).to.equal(code.result);
        }
    });

    it('throws when statusCode is not finite', () => {

        expect(() => {

            new Boom.Boom('', { statusCode: 1 / 0 });
        }).to.throw('First argument must be a number (400+): null');
    });

    it('sets error code to unknown', () => {

        const err = new Boom.Boom('', { statusCode: 999 });
        expect(err.output.payload.error).to.equal('Unknown');
    });

    describe('instanceof', () => {

        it('identifies a boom object', () => {

            expect(new Boom.Boom('oops') instanceof Boom.Boom).to.be.true();
            expect(Boom.badRequest('oops') instanceof Boom.Boom).to.be.true();
            expect(new Error('oops') instanceof Boom.Boom).to.be.false();
            expect(Boom.boomify(new Error('oops')) instanceof Boom.Boom).to.be.true();
            expect({ isBoom: true } instanceof Boom.Boom).to.be.false();
            expect(null instanceof Boom.Boom).to.be.false();
        });
    });

    describe('isBoom()', () => {

        it('identifies a boom object', () => {

            expect(Boom.isBoom(new Boom.Boom('oops'))).to.be.true();
            expect(Boom.isBoom(new Error('oops'))).to.be.false();
            expect(Boom.isBoom({ isBoom: true })).to.be.false();
            expect(Boom.isBoom(null)).to.be.false();
        });

        it('returns true for valid boom object and valid status code', () => {

            expect(Boom.isBoom(Boom.notFound(),404)).to.be.true();
        });

        it('returns false for valid boom object and wrong status code', () => {

            expect(Boom.isBoom(Boom.notFound(),503)).to.be.false();
        });
    });

    describe('boomify()', () => {

        it('returns the same object when already boom', () => {

            const error = Boom.badRequest();
            expect(error).to.equal(Boom.boomify(error));
            expect(error).to.equal(Boom.boomify(error, { statusCode: 444 }));
        });

        it('decorates error', () => {

            const err = new Error('oops');
            Boom.boomify(err, { statusCode: 400, decorate: { x: 1 } });
            expect(err.x).to.equal(1);
        });

        it('returns an error with info when constructed using another error', () => {

            const error = new Error('ka-boom');
            error.xyz = 123;
            const err = Boom.boomify(error);
            expect(err.xyz).to.equal(123);
            expect(err.message).to.equal('ka-boom');
            expect(err.output).to.equal({
                statusCode: 500,
                payload: {
                    statusCode: 500,
                    error: 'Internal Server Error',
                    message: 'An internal server error occurred'
                },
                headers: {}
            });
            expect(err.data).to.equal(null);
        });

        it('does not override data when constructed using another error', () => {

            const error = new Error('ka-boom');
            error.data = { useful: 'data' };
            const err = Boom.boomify(error);
            expect(err.data).to.equal(error.data);
        });

        it('sets new message when none exists', () => {

            const error = new Error();
            const wrapped = Boom.boomify(error, { statusCode: 400, message: 'something bad' });
            expect(wrapped.message).to.equal('something bad');
        });

        it('returns boom error unchanged', () => {

            const error = Boom.badRequest('Missing data', { type: 'user' });
            const boom = Boom.boomify(error);

            expect(boom).to.shallow.equal(error);
            expect(error.data.type).to.equal('user');
            expect(error.output.payload.message).to.equal('Missing data');
            expect(error.output.statusCode).to.equal(400);
        });

        it('defaults to 500', () => {

            const error = new Error('Missing data');
            const boom = Boom.boomify(error);

            expect(boom).to.shallow.equal(error);
            expect(error.output.payload.message).to.equal('An internal server error occurred');
            expect(error.output.statusCode).to.equal(500);
        });

        it('overrides message and statusCode', () => {

            const error = Boom.badRequest('Missing data', { type: 'user' });
            const boom = Boom.boomify(error, { message: 'Override message', statusCode: 599 });

            expect(boom).to.shallow.equal(error);
            expect(error.data.type).to.equal('user');
            expect(error.output.payload.message).to.equal('Override message: Missing data');
            expect(error.output.statusCode).to.equal(599);
        });

        it('overrides message', () => {

            const error = Boom.badRequest('Missing data', { type: 'user' });
            const boom = Boom.boomify(error, { message: 'Override message' });

            expect(boom).to.shallow.equal(error);
            expect(error.data.type).to.equal('user');
            expect(error.output.payload.message).to.equal('Override message: Missing data');
            expect(error.output.statusCode).to.equal(400);
        });

        it('overrides statusCode', () => {

            const error = Boom.badRequest('Missing data', { type: 'user' });
            const boom = Boom.boomify(error, { statusCode: 599 });

            expect(boom).to.shallow.equal(error);
            expect(error.data.type).to.equal('user');
            expect(error.output.payload.message).to.equal('Missing data');
            expect(error.output.statusCode).to.equal(599);
        });

        it('skips override', () => {

            const error = Boom.badRequest('Missing data', { type: 'user' });
            const boom = Boom.boomify(error, { message: 'Override message', statusCode: 599, override: false });

            expect(boom).to.shallow.equal(error);
            expect(error.data.type).to.equal('user');
            expect(error.output.payload.message).to.equal('Missing data');
            expect(error.output.statusCode).to.equal(400);
        });

        it('initializes plain error', () => {

            const error = new Error('Missing data');
            const boom = Boom.boomify(error, { message: 'Override message', statusCode: 599, override: false });

            expect(boom).to.shallow.equal(error);
            expect(error.output.payload.message).to.equal('Override message: Missing data');
            expect(error.output.statusCode).to.equal(599);
        });
    });

    describe('create()', () => {

        it('does not sets null message', () => {

            const error = Boom.unauthorized(null);
            expect(error.output.payload.message).to.equal('Unauthorized');
            expect(error.isServer).to.be.false();
        });

        it('sets message and data', () => {

            const error = Boom.badRequest('Missing data', { type: 'user' });
            expect(error.data.type).to.equal('user');
            expect(error.output.payload.message).to.equal('Missing data');
        });
    });

    describe('initialize()', () => {

        it('does not sets null message', () => {

            const err = new Error('some error message');
            const boom = Boom.boomify(err, { statusCode: 400, message: 'modified error message' });
            expect(boom.output.payload.message).to.equal('modified error message: some error message');
        });
    });

    describe('isBoom()', () => {

        it('returns true for Boom object', () => {

            expect(Boom.badRequest().isBoom).to.equal(true);
        });

        it('returns false for Error object', () => {

            expect((new Error()).isBoom).to.not.exist();
        });
    });

    describe('badRequest()', () => {

        it('returns a 400 error statusCode', () => {

            const error = Boom.badRequest();

            expect(error.output.statusCode).to.equal(400);
            expect(error.isServer).to.be.false();
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.badRequest('my message').message).to.equal('my message');
        });

        it('sets the message to HTTP status if none provided', () => {

            expect(Boom.badRequest().message).to.equal('Bad Request');
        });
    });

    describe('unauthorized()', () => {

        it('returns a 401 error statusCode', () => {

            const err = Boom.unauthorized();
            expect(err.output.statusCode).to.equal(401);
            expect(err.output.headers).to.equal({});
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.unauthorized('my message').message).to.equal('my message');
        });

        it('returns a WWW-Authenticate header when passed a scheme', () => {

            const err = Boom.unauthorized('boom', 'Test');
            expect(err.output.statusCode).to.equal(401);
            expect(err.output.headers['WWW-Authenticate']).to.equal('Test error="boom"');
        });

        it('returns a WWW-Authenticate header when passed a scheme (no message)', () => {

            const err = Boom.unauthorized(null, 'Test');
            expect(err.output.statusCode).to.equal(401);
            expect(err.output.headers['WWW-Authenticate']).to.equal('Test');
        });

        it('returns a WWW-Authenticate header set to the schema array value', () => {

            const err = Boom.unauthorized(null, ['Test', 'one', 'two']);
            expect(err.output.statusCode).to.equal(401);
            expect(err.output.headers['WWW-Authenticate']).to.equal('Test, one, two');
        });

        it('returns a WWW-Authenticate header when passed a scheme and attributes', () => {

            const err = Boom.unauthorized('boom', 'Test', { a: 1, b: 'something', c: null, d: 0 });
            expect(err.output.statusCode).to.equal(401);
            expect(err.output.headers['WWW-Authenticate']).to.equal('Test a="1", b="something", c="", d="0", error="boom"');
            expect(err.output.payload.attributes).to.equal({ a: 1, b: 'something', c: '', d: 0, error: 'boom' });
        });

        it('returns a WWW-Authenticate header from string input instead of object', () => {

            const err = Boom.unauthorized(null, 'Negotiate', 'VGhpcyBpcyBhIHRlc3QgdG9rZW4=');
            expect(err.output.statusCode).to.equal(401);
            expect(err.output.headers['WWW-Authenticate']).to.equal('Negotiate VGhpcyBpcyBhIHRlc3QgdG9rZW4=');
            expect(err.output.payload.attributes).to.equal('VGhpcyBpcyBhIHRlc3QgdG9rZW4=');
        });

        it('returns a WWW-Authenticate header when passed attributes, missing error', () => {

            const err = Boom.unauthorized(null, 'Test', { a: 1, b: 'something', c: null, d: 0, e: undefined });
            expect(err.output.statusCode).to.equal(401);
            expect(err.output.headers['WWW-Authenticate']).to.equal('Test a="1", b="something", c="", d="0", e=""');
            expect(err.isMissing).to.equal(true);
        });

        it('sets the isMissing flag when error message is empty', () => {

            const err = Boom.unauthorized('', 'Basic');
            expect(err.isMissing).to.equal(true);
        });

        it('does not set the isMissing flag when error message is not empty', () => {

            const err = Boom.unauthorized('message', 'Basic');
            expect(err.isMissing).to.equal(undefined);
        });

        it('sets a WWW-Authenticate when passed as an array', () => {

            const err = Boom.unauthorized('message', ['Basic', 'Example e="1"', 'Another x="3", y="4"']);
            expect(err.output.headers['WWW-Authenticate']).to.equal('Basic, Example e="1", Another x="3", y="4"');
        });
    });


    describe('paymentRequired()', () => {

        it('returns a 402 error statusCode', () => {

            expect(Boom.paymentRequired().output.statusCode).to.equal(402);
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.paymentRequired('my message').message).to.equal('my message');
        });

        it('sets the message to HTTP status if none provided', () => {

            expect(Boom.paymentRequired().message).to.equal('Payment Required');
        });
    });


    describe('methodNotAllowed()', () => {

        it('returns a 405 error statusCode', () => {

            expect(Boom.methodNotAllowed().output.statusCode).to.equal(405);
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.methodNotAllowed('my message').message).to.equal('my message');
        });

        it('returns an Allow header when passed a string', () => {

            const err = Boom.methodNotAllowed('my message', null, 'GET');
            expect(err.output.statusCode).to.equal(405);
            expect(err.output.headers.Allow).to.equal('GET');
        });

        it('returns an Allow header when passed an array', () => {

            const err = Boom.methodNotAllowed('my message', null, ['GET', 'POST']);
            expect(err.output.statusCode).to.equal(405);
            expect(err.output.headers.Allow).to.equal('GET, POST');
        });
    });


    describe('notAcceptable()', () => {

        it('returns a 406 error statusCode', () => {

            expect(Boom.notAcceptable().output.statusCode).to.equal(406);
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.notAcceptable('my message').message).to.equal('my message');
        });
    });


    describe('proxyAuthRequired()', () => {

        it('returns a 407 error statusCode', () => {

            expect(Boom.proxyAuthRequired().output.statusCode).to.equal(407);
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.proxyAuthRequired('my message').message).to.equal('my message');
        });
    });


    describe('clientTimeout()', () => {

        it('returns a 408 error statusCode', () => {

            expect(Boom.clientTimeout().output.statusCode).to.equal(408);
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.clientTimeout('my message').message).to.equal('my message');
        });
    });


    describe('conflict()', () => {

        it('returns a 409 error statusCode', () => {

            expect(Boom.conflict().output.statusCode).to.equal(409);
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.conflict('my message').message).to.equal('my message');
        });
    });


    describe('resourceGone()', () => {

        it('returns a 410 error statusCode', () => {

            expect(Boom.resourceGone().output.statusCode).to.equal(410);
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.resourceGone('my message').message).to.equal('my message');
        });
    });


    describe('lengthRequired()', () => {

        it('returns a 411 error statusCode', () => {

            expect(Boom.lengthRequired().output.statusCode).to.equal(411);
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.lengthRequired('my message').message).to.equal('my message');
        });
    });


    describe('preconditionFailed()', () => {

        it('returns a 412 error statusCode', () => {

            expect(Boom.preconditionFailed().output.statusCode).to.equal(412);
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.preconditionFailed('my message').message).to.equal('my message');
        });
    });


    describe('entityTooLarge()', () => {

        it('returns a 413 error statusCode', () => {

            expect(Boom.entityTooLarge().output.statusCode).to.equal(413);
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.entityTooLarge('my message').message).to.equal('my message');
        });
    });


    describe('uriTooLong()', () => {

        it('returns a 414 error statusCode', () => {

            expect(Boom.uriTooLong().output.statusCode).to.equal(414);
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.uriTooLong('my message').message).to.equal('my message');
        });
    });


    describe('unsupportedMediaType()', () => {

        it('returns a 415 error statusCode', () => {

            expect(Boom.unsupportedMediaType().output.statusCode).to.equal(415);
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.unsupportedMediaType('my message').message).to.equal('my message');
        });
    });


    describe('rangeNotSatisfiable()', () => {

        it('returns a 416 error statusCode', () => {

            expect(Boom.rangeNotSatisfiable().output.statusCode).to.equal(416);
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.rangeNotSatisfiable('my message').message).to.equal('my message');
        });
    });


    describe('expectationFailed()', () => {

        it('returns a 417 error statusCode', () => {

            expect(Boom.expectationFailed().output.statusCode).to.equal(417);
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.expectationFailed('my message').message).to.equal('my message');
        });
    });


    describe('teapot()', () => {

        it('returns a 418 error statusCode', () => {

            expect(Boom.teapot().output.statusCode).to.equal(418);
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.teapot('Sorry, no coffee...').message).to.equal('Sorry, no coffee...');
        });
    });


    describe('badData()', () => {

        it('returns a 422 error statusCode', () => {

            expect(Boom.badData().output.statusCode).to.equal(422);
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.badData('my message').message).to.equal('my message');
        });
    });


    describe('locked()', () => {

        it('returns a 423 error statusCode', () => {

            expect(Boom.locked().output.statusCode).to.equal(423);
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.locked('my message').message).to.equal('my message');
        });
    });

    describe('failedDependency()', () => {

        it('returns a 424 error statusCode', () => {

            expect(Boom.failedDependency().output.statusCode).to.equal(424);
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.failedDependency('my message').message).to.equal('my message');
        });
    });

    describe('tooEarly()', () => {

        it('returns a 425 error statusCode', () => {

            expect(Boom.tooEarly().output.statusCode).to.equal(425);
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.tooEarly('my message').message).to.equal('my message');
        });
    });


    describe('preconditionRequired()', () => {

        it('returns a 428 error statusCode', () => {

            expect(Boom.preconditionRequired().output.statusCode).to.equal(428);
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.preconditionRequired('my message').message).to.equal('my message');
        });
    });


    describe('tooManyRequests()', () => {

        it('returns a 429 error statusCode', () => {

            expect(Boom.tooManyRequests().output.statusCode).to.equal(429);
        });

        it('sets the message with the passed-in message', () => {

            expect(Boom.tooManyRequests('my message').message).to.equal('my message');
        });
    });


    describe('illegal()', () => {

        it('returns a 451 error statusCode', () => {

            expect(Boom.illegal().output.statusCode).to.equal(451);
        });

        it('sets the message with the passed-in message', () => {

            expect(Boom.illegal('my message').message).to.equal('my message');
        });
    });

    describe('serverUnavailable()', () => {

        it('returns a 503 error statusCode', () => {

            expect(Boom.serverUnavailable().output.statusCode).to.equal(503);
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.serverUnavailable('my message').message).to.equal('my message');
        });
    });

    describe('forbidden()', () => {

        it('returns a 403 error statusCode', () => {

            expect(Boom.forbidden().output.statusCode).to.equal(403);
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.forbidden('my message').message).to.equal('my message');
        });
    });

    describe('notFound()', () => {

        it('returns a 404 error statusCode', () => {

            expect(Boom.notFound().output.statusCode).to.equal(404);
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.notFound('my message').message).to.equal('my message');
        });
    });

    describe('internal()', () => {

        it('returns a 500 error statusCode', () => {

            expect(Boom.internal().output.statusCode).to.equal(500);
        });

        it('sets the message with the passed in message', () => {

            const err = Boom.internal('my message');
            expect(err.message).to.equal('my message');
            expect(err.isServer).to.true();
            expect(err.output.payload.message).to.equal('An internal server error occurred');
        });

        it('passes data on the callback if its passed in', () => {

            expect(Boom.internal('my message', { my: 'data' }).data.my).to.equal('data');
        });

        it('returns an error with composite message', () => {

            const x = {};

            try {
                x.foo();
            }
            catch (err) {
                const boom = Boom.internal('Someting bad', err);
                expect(boom.message).to.equal('Someting bad: x.foo is not a function');
                expect(boom.isServer).to.be.true();
            }
        });
    });

    describe('notImplemented()', () => {

        it('returns a 501 error statusCode', () => {

            expect(Boom.notImplemented().output.statusCode).to.equal(501);
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.notImplemented('my message').message).to.equal('my message');
        });
    });

    describe('badGateway()', () => {

        it('returns a 502 error statusCode', () => {

            expect(Boom.badGateway().output.statusCode).to.equal(502);
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.badGateway('my message').message).to.equal('my message');
        });

        it('retains source boom error as data when wrapped', () => {

            const upstream = Boom.serverUnavailable();
            const boom = Boom.badGateway('Upstream error', upstream);
            expect(boom.output.statusCode).to.equal(502);
            expect(boom.data).to.equal(upstream);
        });
    });

    describe('gatewayTimeout()', () => {

        it('returns a 504 error statusCode', () => {

            expect(Boom.gatewayTimeout().output.statusCode).to.equal(504);
        });

        it('sets the message with the passed in message', () => {

            expect(Boom.gatewayTimeout('my message').message).to.equal('my message');
        });
    });

    describe('badImplementation()', () => {

        it('returns a 500 error statusCode', () => {

            const err = Boom.badImplementation();
            expect(err.output.statusCode).to.equal(500);
            expect(err.isDeveloperError).to.equal(true);
            expect(err.isServer).to.be.true();
        });

        it('hides error from user when error data is included', () => {

            const err = Boom.badImplementation('Invalid', new Error('kaboom'));
            expect(err.output).to.equal({
                headers: {},
                statusCode: 500,
                payload: {
                    error: 'Internal Server Error',
                    message: 'An internal server error occurred',
                    statusCode: 500
                }
            });
        });

        it('hides error from user when error data is included (boom)', () => {

            const err = Boom.badImplementation('Invalid', Boom.badRequest('kaboom'));
            expect(err.isDeveloperError).to.equal(true);
            expect(err.output).to.equal({
                headers: {},
                statusCode: 500,
                payload: {
                    error: 'Internal Server Error',
                    message: 'An internal server error occurred',
                    statusCode: 500
                }
            });
        });
    });

    describe('stack trace', () => {

        it('should omit lib', () => {

            ['badRequest', 'unauthorized', 'forbidden', 'notFound', 'methodNotAllowed',
                'notAcceptable', 'proxyAuthRequired', 'clientTimeout', 'conflict',
                'resourceGone', 'lengthRequired', 'preconditionFailed', 'entityTooLarge',
                'uriTooLong', 'unsupportedMediaType', 'rangeNotSatisfiable', 'expectationFailed',
                'badData', 'preconditionRequired', 'tooManyRequests',

                // 500s
                'internal', 'notImplemented', 'badGateway', 'serverUnavailable',
                'gatewayTimeout', 'badImplementation'
            ].forEach((name) => {

                const err = Boom[name]();
                expect(err.stack).to.not.match(/\/lib\/index\.js/);
            });
        });
    });

    describe('method with error object instead of message', () => {

        [
            'badRequest',
            'unauthorized',
            'forbidden',
            'notFound',
            'methodNotAllowed',
            'notAcceptable',
            'proxyAuthRequired',
            'clientTimeout',
            'conflict',
            'resourceGone',
            'lengthRequired',
            'preconditionFailed',
            'entityTooLarge',
            'uriTooLong',
            'unsupportedMediaType',
            'rangeNotSatisfiable',
            'expectationFailed',
            'badData',
            'preconditionRequired',
            'tooManyRequests',
            'internal',
            'notImplemented',
            'badGateway',
            'serverUnavailable',
            'gatewayTimeout',
            'badImplementation'
        ].forEach((name) => {

            it(`should allow \`Boom${name}(err)\` and preserve the error`, () => {

                const error = new Error('An example mongoose validation error');
                error.name = 'ValidationError';
                const err = Boom[name](error);
                expect(err.name).to.equal('ValidationError');
                expect(err.message).to.equal('An example mongoose validation error');
            });

            // exclude unauthorized

            if (name !== 'unauthorized') {

                it(`should allow \`Boom.${name}(err, data)\` and preserve the data`, () => {

                    const error = new Error();
                    const err = Boom[name](error, { foo: 'bar' });
                    expect(err.data).to.equal({ foo: 'bar' });
                });
            }
        });
    });

    describe('error.typeof', () => {

        const types = [
            'badRequest',
            'unauthorized',
            'forbidden',
            'notFound',
            'methodNotAllowed',
            'notAcceptable',
            'proxyAuthRequired',
            'clientTimeout',
            'conflict',
            'resourceGone',
            'lengthRequired',
            'preconditionFailed',
            'entityTooLarge',
            'uriTooLong',
            'unsupportedMediaType',
            'rangeNotSatisfiable',
            'expectationFailed',
            'badData',
            'preconditionRequired',
            'tooManyRequests',
            'internal',
            'notImplemented',
            'badGateway',
            'serverUnavailable',
            'gatewayTimeout',
            'badImplementation'
        ];

        types.forEach((name) => {

            it(`matches typeof Boom.${name}`, () => {

                const error = Boom[name]();
                types.forEach((type) => {

                    if (type === name) {
                        expect(error.typeof).to.equal(Boom[name]);
                    }
                    else {
                        expect(error.typeof).to.not.equal(Boom[type]);
                    }
                });
            });
        });
    });

    describe('reformat()', () => {

        it('displays internal server error messages in debug mode', () => {

            const error = new Error('ka-boom');
            const err = Boom.boomify(error, { statusCode: 500 });

            err.reformat(false);
            expect(err.output).to.equal({
                statusCode: 500,
                payload: {
                    statusCode: 500,
                    error: 'Internal Server Error',
                    message: 'An internal server error occurred'
                },
                headers: {}
            });

            err.reformat(true);
            expect(err.output).to.equal({
                statusCode: 500,
                payload: {
                    statusCode: 500,
                    error: 'Internal Server Error',
                    message: 'ka-boom'
                },
                headers: {}
            });
        });
    });
});

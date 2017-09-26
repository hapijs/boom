'use strict';

// Load modules

const Code = require('code');
const Boom = require('../lib');
const Lab = require('lab');


// Declare internals

const internals = {};


// Test shortcuts

const { describe, it } = exports.lab = Lab.script();
const expect = Code.expect;


describe('Boom', () => {

    it('returns the same object when already boom', async () => {

        const error = Boom.badRequest();
        expect(error).to.equal(Boom.wrap(error));
        expect(error).to.equal(Boom.wrap(error, null, null));
    });

    it('errors on wrap with boom error and additional arguments', async () => {

        const error = Boom.badRequest('Something');
        expect(() => Boom.wrap(error, 401)).to.throw('Cannot provide statusCode or message with boom error');
        expect(() => Boom.wrap(error, 402, 'Else')).to.throw('Cannot provide statusCode or message with boom error');
        expect(() => Boom.wrap(error, undefined, 'Else')).to.throw('Cannot provide statusCode or message with boom error');
    });

    it('returns an error with info when constructed using another error', async () => {

        const error = new Error('ka-boom');
        error.xyz = 123;
        const err = Boom.wrap(error);
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

    it('does not override data when constructed using another error', async () => {

        const error = new Error('ka-boom');
        error.data = { useful: 'data' };
        const err = Boom.wrap(error);
        expect(err.data).to.equal(error.data);
    });

    it('sets new message when none exists', async () => {

        const error = new Error();
        const wrapped = Boom.wrap(error, 400, 'something bad');
        expect(wrapped.message).to.equal('something bad');
    });

    it('throws when statusCode is not a number', async () => {

        expect(() => {

            Boom.create('x');
        }).to.throw('First argument must be a number (400+): x');
    });

    it('will cast a number-string to an integer', async () => {

        const codes = [
            { input: '404', result: 404 },
            { input: '404.1', result: 404 },
            { input: 400, result: 400 },
            { input: 400.123, result: 400 }
        ];

        for (let i = 0; i < codes.length; ++i) {
            const code = codes[i];
            const err = Boom.create(code.input);
            expect(err.output.statusCode).to.equal(code.result);
        }
    });

    it('throws when statusCode is not finite', async () => {

        expect(() => {

            Boom.create(1 / 0);
        }).to.throw('First argument must be a number (400+): null');
    });

    it('sets error code to unknown', async () => {

        const err = Boom.create(999);
        expect(err.output.payload.error).to.equal('Unknown');
    });

    describe('boomify()', () => {

        it('returns boom error unchanged', async () => {

            const error = Boom.badRequest('Missing data', { type: 'user' });
            const boom = Boom.boomify(error);

            expect(boom).to.shallow.equal(error);
            expect(error.data.type).to.equal('user');
            expect(error.output.payload.message).to.equal('Missing data');
            expect(error.output.statusCode).to.equal(400);
        });

        it('defaults to 500', async () => {

            const error = new Error('Missing data');
            const boom = Boom.boomify(error);

            expect(boom).to.shallow.equal(error);
            expect(error.output.payload.message).to.equal('An internal server error occurred');
            expect(error.output.statusCode).to.equal(500);
        });

        it('overrides message and statusCode', async () => {

            const error = Boom.badRequest('Missing data', { type: 'user' });
            const boom = Boom.boomify(error, { message: 'Override message', statusCode: 599 });

            expect(boom).to.shallow.equal(error);
            expect(error.data.type).to.equal('user');
            expect(error.output.payload.message).to.equal('Override message: Missing data');
            expect(error.output.statusCode).to.equal(599);
        });

        it('overrides message', async () => {

            const error = Boom.badRequest('Missing data', { type: 'user' });
            const boom = Boom.boomify(error, { message: 'Override message' });

            expect(boom).to.shallow.equal(error);
            expect(error.data.type).to.equal('user');
            expect(error.output.payload.message).to.equal('Override message: Missing data');
            expect(error.output.statusCode).to.equal(400);
        });

        it('overrides statusCode', async () => {

            const error = Boom.badRequest('Missing data', { type: 'user' });
            const boom = Boom.boomify(error, { statusCode: 599 });

            expect(boom).to.shallow.equal(error);
            expect(error.data.type).to.equal('user');
            expect(error.output.payload.message).to.equal('Missing data');
            expect(error.output.statusCode).to.equal(599);
        });

        it('skips override', async () => {

            const error = Boom.badRequest('Missing data', { type: 'user' });
            const boom = Boom.boomify(error, { message: 'Override message', statusCode: 599, override: false });

            expect(boom).to.shallow.equal(error);
            expect(error.data.type).to.equal('user');
            expect(error.output.payload.message).to.equal('Missing data');
            expect(error.output.statusCode).to.equal(400);
        });

        it('initializes plain error', async () => {

            const error = new Error('Missing data');
            const boom = Boom.boomify(error, { message: 'Override message', statusCode: 599, override: false });

            expect(boom).to.shallow.equal(error);
            expect(error.output.payload.message).to.equal('Override message: Missing data');
            expect(error.output.statusCode).to.equal(599);
        });
    });

    describe('create()', () => {

        it('does not sets null message', async () => {

            const error = Boom.unauthorized(null);
            expect(error.output.payload.message).to.equal('Unauthorized');
            expect(error.isServer).to.be.false();
        });

        it('sets message and data', async () => {

            const error = Boom.badRequest('Missing data', { type: 'user' });
            expect(error.data.type).to.equal('user');
            expect(error.output.payload.message).to.equal('Missing data');
        });
    });

    describe('initialize()', () => {

        it('does not sets null message', async () => {

            const err = new Error('some error message');
            const boom = Boom.wrap(err, 400, 'modified error message');
            expect(boom.output.payload.message).to.equal('modified error message: some error message');
        });
    });

    describe('isBoom()', () => {

        it('returns true for Boom object', async () => {

            expect(Boom.badRequest().isBoom).to.equal(true);
        });

        it('returns false for Error object', async () => {

            expect((new Error()).isBoom).to.not.exist();
        });
    });

    describe('badRequest()', () => {

        it('returns a 400 error statusCode', async () => {

            const error = Boom.badRequest();

            expect(error.output.statusCode).to.equal(400);
            expect(error.isServer).to.be.false();
        });

        it('sets the message with the passed in message', async () => {

            expect(Boom.badRequest('my message').message).to.equal('my message');
        });

        it('sets the message to HTTP status if none provided', async () => {

            expect(Boom.badRequest().message).to.equal('Bad Request');
        });
    });

    describe('unauthorized()', () => {

        it('returns a 401 error statusCode', async () => {

            const err = Boom.unauthorized();
            expect(err.output.statusCode).to.equal(401);
            expect(err.output.headers).to.equal({});
        });

        it('sets the message with the passed in message', async () => {

            expect(Boom.unauthorized('my message').message).to.equal('my message');
        });

        it('returns a WWW-Authenticate header when passed a scheme', async () => {

            const err = Boom.unauthorized('boom', 'Test');
            expect(err.output.statusCode).to.equal(401);
            expect(err.output.headers['WWW-Authenticate']).to.equal('Test error="boom"');
        });

        it('returns a WWW-Authenticate header set to the schema array value', async () => {

            const err = Boom.unauthorized(null, ['Test', 'one', 'two']);
            expect(err.output.statusCode).to.equal(401);
            expect(err.output.headers['WWW-Authenticate']).to.equal('Test, one, two');
        });

        it('returns a WWW-Authenticate header when passed a scheme and attributes', async () => {

            const err = Boom.unauthorized('boom', 'Test', { a: 1, b: 'something', c: null, d: 0 });
            expect(err.output.statusCode).to.equal(401);
            expect(err.output.headers['WWW-Authenticate']).to.equal('Test a="1", b="something", c="", d="0", error="boom"');
            expect(err.output.payload.attributes).to.equal({ a: 1, b: 'something', c: '', d: 0, error: 'boom' });
        });

        it('returns a WWW-Authenticate header from string input instead of object', async () => {

            const err = Boom.unauthorized(null, 'Negotiate', 'VGhpcyBpcyBhIHRlc3QgdG9rZW4=');
            expect(err.output.statusCode).to.equal(401);
            expect(err.output.headers['WWW-Authenticate']).to.equal('Negotiate VGhpcyBpcyBhIHRlc3QgdG9rZW4=');
            expect(err.output.payload.attributes).to.equal('VGhpcyBpcyBhIHRlc3QgdG9rZW4=');
        });

        it('returns a WWW-Authenticate header when passed attributes, missing error', async () => {

            const err = Boom.unauthorized(null, 'Test', { a: 1, b: 'something', c: null, d: 0 });
            expect(err.output.statusCode).to.equal(401);
            expect(err.output.headers['WWW-Authenticate']).to.equal('Test a="1", b="something", c="", d="0"');
            expect(err.isMissing).to.equal(true);
        });

        it('sets the isMissing flag when error message is empty', async () => {

            const err = Boom.unauthorized('', 'Basic');
            expect(err.isMissing).to.equal(true);
        });

        it('does not set the isMissing flag when error message is not empty', async () => {

            const err = Boom.unauthorized('message', 'Basic');
            expect(err.isMissing).to.equal(undefined);
        });

        it('sets a WWW-Authenticate when passed as an array', async () => {

            const err = Boom.unauthorized('message', ['Basic', 'Example e="1"', 'Another x="3", y="4"']);
            expect(err.output.headers['WWW-Authenticate']).to.equal('Basic, Example e="1", Another x="3", y="4"');
        });
    });


    describe('paymentRequired()', () => {

        it('returns a 402 error statusCode', async () => {

            expect(Boom.paymentRequired().output.statusCode).to.equal(402);
        });

        it('sets the message with the passed in message', async () => {

            expect(Boom.paymentRequired('my message').message).to.equal('my message');
        });

        it('sets the message to HTTP status if none provided', async () => {

            expect(Boom.paymentRequired().message).to.equal('Payment Required');
        });
    });


    describe('methodNotAllowed()', () => {

        it('returns a 405 error statusCode', async () => {

            expect(Boom.methodNotAllowed().output.statusCode).to.equal(405);
        });

        it('sets the message with the passed in message', async () => {

            expect(Boom.methodNotAllowed('my message').message).to.equal('my message');
        });

        it('returns an Allow header when passed a string', async () => {

            const err = Boom.methodNotAllowed('my message', null, 'GET');
            expect(err.output.statusCode).to.equal(405);
            expect(err.output.headers.Allow).to.equal('GET');
        });

        it('returns an Allow header when passed an array', async () => {

            const err = Boom.methodNotAllowed('my message', null, ['GET', 'POST']);
            expect(err.output.statusCode).to.equal(405);
            expect(err.output.headers.Allow).to.equal('GET, POST');
        });
    });


    describe('notAcceptable()', () => {

        it('returns a 406 error statusCode', async () => {

            expect(Boom.notAcceptable().output.statusCode).to.equal(406);
        });

        it('sets the message with the passed in message', async () => {

            expect(Boom.notAcceptable('my message').message).to.equal('my message');
        });
    });


    describe('proxyAuthRequired()', () => {

        it('returns a 407 error statusCode', async () => {

            expect(Boom.proxyAuthRequired().output.statusCode).to.equal(407);
        });

        it('sets the message with the passed in message', async () => {

            expect(Boom.proxyAuthRequired('my message').message).to.equal('my message');
        });
    });


    describe('clientTimeout()', () => {

        it('returns a 408 error statusCode', async () => {

            expect(Boom.clientTimeout().output.statusCode).to.equal(408);
        });

        it('sets the message with the passed in message', async () => {

            expect(Boom.clientTimeout('my message').message).to.equal('my message');
        });
    });


    describe('conflict()', () => {

        it('returns a 409 error statusCode', async () => {

            expect(Boom.conflict().output.statusCode).to.equal(409);
        });

        it('sets the message with the passed in message', async () => {

            expect(Boom.conflict('my message').message).to.equal('my message');
        });
    });


    describe('resourceGone()', () => {

        it('returns a 410 error statusCode', async () => {

            expect(Boom.resourceGone().output.statusCode).to.equal(410);
        });

        it('sets the message with the passed in message', async () => {

            expect(Boom.resourceGone('my message').message).to.equal('my message');
        });
    });


    describe('lengthRequired()', () => {

        it('returns a 411 error statusCode', async () => {

            expect(Boom.lengthRequired().output.statusCode).to.equal(411);
        });

        it('sets the message with the passed in message', async () => {

            expect(Boom.lengthRequired('my message').message).to.equal('my message');
        });
    });


    describe('preconditionFailed()', () => {

        it('returns a 412 error statusCode', async () => {

            expect(Boom.preconditionFailed().output.statusCode).to.equal(412);
        });

        it('sets the message with the passed in message', async () => {

            expect(Boom.preconditionFailed('my message').message).to.equal('my message');
        });
    });


    describe('entityTooLarge()', () => {

        it('returns a 413 error statusCode', async () => {

            expect(Boom.entityTooLarge().output.statusCode).to.equal(413);
        });

        it('sets the message with the passed in message', async () => {

            expect(Boom.entityTooLarge('my message').message).to.equal('my message');
        });
    });


    describe('uriTooLong()', () => {

        it('returns a 414 error statusCode', async () => {

            expect(Boom.uriTooLong().output.statusCode).to.equal(414);
        });

        it('sets the message with the passed in message', async () => {

            expect(Boom.uriTooLong('my message').message).to.equal('my message');
        });
    });


    describe('unsupportedMediaType()', () => {

        it('returns a 415 error statusCode', async () => {

            expect(Boom.unsupportedMediaType().output.statusCode).to.equal(415);
        });

        it('sets the message with the passed in message', async () => {

            expect(Boom.unsupportedMediaType('my message').message).to.equal('my message');
        });
    });


    describe('rangeNotSatisfiable()', () => {

        it('returns a 416 error statusCode', async () => {

            expect(Boom.rangeNotSatisfiable().output.statusCode).to.equal(416);
        });

        it('sets the message with the passed in message', async () => {

            expect(Boom.rangeNotSatisfiable('my message').message).to.equal('my message');
        });
    });


    describe('expectationFailed()', () => {

        it('returns a 417 error statusCode', async () => {

            expect(Boom.expectationFailed().output.statusCode).to.equal(417);
        });

        it('sets the message with the passed in message', async () => {

            expect(Boom.expectationFailed('my message').message).to.equal('my message');
        });
    });


    describe('teapot()', () => {

        it('returns a 418 error statusCode', async () => {

            expect(Boom.teapot().output.statusCode).to.equal(418);
        });

        it('sets the message with the passed in message', async () => {

            expect(Boom.teapot('Sorry, no coffee...').message).to.equal('Sorry, no coffee...');
        });
    });


    describe('badData()', () => {

        it('returns a 422 error statusCode', async () => {

            expect(Boom.badData().output.statusCode).to.equal(422);
        });

        it('sets the message with the passed in message', async () => {

            expect(Boom.badData('my message').message).to.equal('my message');
        });
    });


    describe('locked()', () => {

        it('returns a 423 error statusCode', async () => {

            expect(Boom.locked().output.statusCode).to.equal(423);
        });

        it('sets the message with the passed in message', async () => {

            expect(Boom.locked('my message').message).to.equal('my message');
        });
    });


    describe('preconditionRequired()', () => {

        it('returns a 428 error statusCode', async () => {

            expect(Boom.preconditionRequired().output.statusCode).to.equal(428);
        });

        it('sets the message with the passed in message', async () => {

            expect(Boom.preconditionRequired('my message').message).to.equal('my message');
        });
    });


    describe('tooManyRequests()', () => {

        it('returns a 429 error statusCode', async () => {

            expect(Boom.tooManyRequests().output.statusCode).to.equal(429);
        });

        it('sets the message with the passed-in message', async () => {

            expect(Boom.tooManyRequests('my message').message).to.equal('my message');
        });
    });


    describe('illegal()', () => {

        it('returns a 451 error statusCode', async () => {

            expect(Boom.illegal().output.statusCode).to.equal(451);
        });

        it('sets the message with the passed-in message', async () => {

            expect(Boom.illegal('my message').message).to.equal('my message');
        });
    });

    describe('serverUnavailable()', () => {

        it('returns a 503 error statusCode', async () => {

            expect(Boom.serverUnavailable().output.statusCode).to.equal(503);
        });

        it('sets the message with the passed in message', async () => {

            expect(Boom.serverUnavailable('my message').message).to.equal('my message');
        });
    });

    describe('forbidden()', () => {

        it('returns a 403 error statusCode', async () => {

            expect(Boom.forbidden().output.statusCode).to.equal(403);
        });

        it('sets the message with the passed in message', async () => {

            expect(Boom.forbidden('my message').message).to.equal('my message');
        });
    });

    describe('notFound()', () => {

        it('returns a 404 error statusCode', async () => {

            expect(Boom.notFound().output.statusCode).to.equal(404);
        });

        it('sets the message with the passed in message', async () => {

            expect(Boom.notFound('my message').message).to.equal('my message');
        });
    });

    describe('internal()', () => {

        it('returns a 500 error statusCode', async () => {

            expect(Boom.internal().output.statusCode).to.equal(500);
        });

        it('sets the message with the passed in message', async () => {

            const err = Boom.internal('my message');
            expect(err.message).to.equal('my message');
            expect(err.isServer).to.true();
            expect(err.output.payload.message).to.equal('An internal server error occurred');
        });

        it('passes data on the callback if its passed in', async () => {

            expect(Boom.internal('my message', { my: 'data' }).data.my).to.equal('data');
        });

        it('returns an error with composite message', async () => {

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

        it('returns a 501 error statusCode', async () => {

            expect(Boom.notImplemented().output.statusCode).to.equal(501);
        });

        it('sets the message with the passed in message', async () => {

            expect(Boom.notImplemented('my message').message).to.equal('my message');
        });
    });

    describe('badGateway()', () => {

        it('returns a 502 error statusCode', async () => {

            expect(Boom.badGateway().output.statusCode).to.equal(502);
        });

        it('sets the message with the passed in message', async () => {

            expect(Boom.badGateway('my message').message).to.equal('my message');
        });

        it('retains source boom error as data when wrapped', async () => {

            const upstream = Boom.serverUnavailable();
            const boom = Boom.badGateway('Upstream error', upstream);
            expect(boom.output.statusCode).to.equal(502);
            expect(boom.data).to.equal(upstream);
        });
    });

    describe('gatewayTimeout()', () => {

        it('returns a 504 error statusCode', async () => {

            expect(Boom.gatewayTimeout().output.statusCode).to.equal(504);
        });

        it('sets the message with the passed in message', async () => {

            expect(Boom.gatewayTimeout('my message').message).to.equal('my message');
        });
    });

    describe('badImplementation()', () => {

        it('returns a 500 error statusCode', async () => {

            const err = Boom.badImplementation();
            expect(err.output.statusCode).to.equal(500);
            expect(err.isDeveloperError).to.equal(true);
            expect(err.isServer).to.be.true();
        });

        it('hides error from user when error data is included', async () => {

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

        it('hides error from user when error data is included (boom)', async () => {

            const err = Boom.badImplementation('Invalid', Boom.badRequest('kaboom'));
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

        it('should omit lib', async () => {

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

            it(`should allow \`Boom${name}(err)\` and preserve the error`, async () => {

                const error = new Error('An example mongoose validation error');
                error.name = 'ValidationError';
                const err = Boom[name](error);
                expect(err.name).to.equal('ValidationError');
                expect(err.message).to.equal('An example mongoose validation error');
            });

            // exclude unauthorized

            if (name !== 'unauthorized') {

                it(`should allow \`Boom.${name}(err, data)\` and preserve the data`, async () => {

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

            it(`matches typeof Boom.${name}`, async () => {

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
});

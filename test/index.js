import * as Boom10 from '@hapi/boom10';
import { describe, expect, it, onTestFinished } from 'vitest';

import * as Boom from '../src/index.js';

describe('Boom', () => {
    it('constructs error object (new)', () => {
        const err = new Boom.Boom('oops', { statusCode: 400 });
        expect(err.output.payload.message).toBe('oops');
        expect(err.output.statusCode).toBe(400);

        expect(err.name).toBe('Boom');
        expect(Object.keys(err)).toEqual(['data', 'output']);
        expect(JSON.stringify(err)).toBe(
            '{"data":null,"output":{"statusCode":400,"payload":{"statusCode":400,"error":"Bad Request","message":"oops"},"headers":{}}}',
        );
    });

    it('instances has .name "Boom"', () => {
        class SubBoom extends Boom.Boom {}

        expect(new Boom.Boom().name).toBe('Boom');
        expect(new SubBoom().name).toBe('Boom');
    });

    it('instances .name can be changed', () => {
        class SubBoom extends Boom.Boom {
            name = 'BadaBoom';
        }

        const err = new Boom.Boom();
        err.name = 'MyBoom';

        expect(err.name).toBe('MyBoom');
        expect(new SubBoom().name).toBe('BadaBoom');
    });

    it('handles missing message', () => {
        const err = new Boom.Boom();

        expect(Boom.isBoom(err)).toBe(true);
        expect(err.message).toBe('Internal Server Error');
    });

    it('handles missing message with unknown statusCode', () => {
        const err = new Boom.Boom(null, { statusCode: 999 });

        expect(Boom.isBoom(err)).toBe(true);
        expect(err.message).toBe('Unknown');
    });

    it('handles missing message (subclass)', () => {
        const Example = class extends Boom.Boom {};

        const err = new Example();
        expect(Boom.isBoom(err)).toBe(true);
    });

    it('handles headers option', () => {
        const err = new Boom.Boom('fail', { statusCode: 400, headers: { custom: 'yes' } });
        expect(err.output.payload.message).toBe('fail');
        expect(err.output.statusCode).toBe(400);
        expect(err.output.headers).toEqual({ custom: 'yes' });
    });

    it('clones headers object', () => {
        const headers = { custom: ['yes'] };
        const err = new Boom.Boom('fail', { statusCode: 400, headers });
        err.output.headers.custom.push('more');
        err.output.headers.extra = 'added';

        expect(err.output.headers).toEqual({ custom: ['yes', 'more'], extra: 'added' });
        expect(headers).toEqual({ custom: ['yes'] });
    });

    it('throws TypeError on non-object headers option', () => {
        expect(() => new Boom.Boom('fail', { statusCode: 400, headers: true })).toThrow(TypeError);
        expect(() => new Boom.Boom('fail', { statusCode: 400, headers: null })).toThrow(TypeError);
    });

    it('throws when statusCode is invalid', () => {
        expect(() => new Boom.Boom('message', { statusCode: 'x' })).toThrow('statusCode must be a number (400+): x');

        expect(() => new Boom.Boom('message', { statusCode: '200' })).toThrow(
            'statusCode must be a number (400+): 200',
        );
    });

    it('will cast a statusCode number-string to an integer', () => {
        const codes = [
            { input: '404', result: 404 },
            { input: '404.1', result: 404 },
            { input: 400, result: 400 },
            { input: 400.123, result: 400 },
        ];

        for (const code of codes) {
            const err = new Boom.Boom('', { statusCode: code.input });
            expect(err.output.statusCode).toBe(code.result);
        }
    });

    it('throws TypeError when statusCode is not finite', () => {
        const fn = () => new Boom.Boom('', { statusCode: 1 / 0 });

        expect(fn).toThrow(TypeError);
        expect(fn).toThrow('statusCode must be a number (400+): Infinity');
    });

    it('sets error code to unknown', () => {
        const err = new Boom.Boom('', { statusCode: 999 });
        expect(err.output.payload.error).toBe('Unknown');
    });

    it('only sets cause when part of options', () => {
        const err1 = new Boom.Boom('fail', { cause: undefined });
        expect(Object.hasOwn(err1, 'cause')).toBe(true);
        expect(err1.cause).toBeUndefined();

        const err2 = new Boom.Boom('fail', {});
        expect(Object.hasOwn(err2, 'cause')).toBe(false);
        expect(err2.cause).toBeUndefined();
    });

    it('assigns a .cause property if Error does not support it', () => {
        const proto = Object.getPrototypeOf(Boom.Boom);
        Object.setPrototypeOf(
            Boom.Boom,
            class extends Error {
                constructor(message) {
                    super(message);
                }
            },
        );

        onTestFinished(() => {
            Object.setPrototypeOf(Boom.Boom, proto);
        });

        const err = new Boom.Boom('fail', { cause: 0 });
        expect(err.cause).toBe(0);
    });

    describe('instanceof', () => {
        it('identifies a boom object', () => {
            const BadaBoom = class extends Boom.Boom {};

            expect(new Boom.Boom('oops')).toBeInstanceOf(Boom.Boom);
            expect(new Boom10.Boom('oops')).toBeInstanceOf(Boom.Boom);
            expect(new BadaBoom('oops')).toBeInstanceOf(Boom.Boom);
            expect(Boom.badRequest('oops')).toBeInstanceOf(Boom.Boom);
            expect(new Error('oops')).not.toBeInstanceOf(Boom.Boom);
            expect({ isBoom: true }).not.toBeInstanceOf(Boom.Boom);
            expect(null).not.toBeInstanceOf(Boom.Boom);
        });

        it('can be called on a sub-class', () => {
            const BadaBoom = class extends Boom.Boom {};

            // Success

            expect(new BadaBoom('oops')).toBeInstanceOf(BadaBoom);
            expect(Object.create(BadaBoom.prototype)).toBeInstanceOf(BadaBoom);

            // Fail

            expect(new Boom.Boom('oops')).not.toBeInstanceOf(BadaBoom);
            expect(Boom.badRequest('oops')).not.toBeInstanceOf(BadaBoom);
        });

        it('works from legacy boom', () => {
            expect(new Boom.Boom('oops')).toBeInstanceOf(Boom10.Boom);
            expect(new Boom10.Boom('oops')).toBeInstanceOf(Boom10.Boom);
        });
    });

    describe('isBoom()', () => {
        it('identifies a boom object', () => {
            // Success

            expect(Boom.isBoom(new Boom.Boom('oops'))).toBe(true);
            expect(Boom.isBoom(new Boom10.Boom('oops'))).toBe(true);

            // Fail

            expect(Boom.isBoom(new Error('oops'))).toBe(false);
            expect(Boom.isBoom({ isBoom: true })).toBe(false);
            expect(Boom.isBoom(null)).toBe(false);
        });

        it('returns true for valid boom object and valid status code', () => {
            expect(Boom.isBoom(Boom.notFound(), 404)).toBe(true);
            expect(Boom.isBoom(Boom10.notFound(), 404)).toBe(true);
        });

        it('returns false for valid boom object and wrong status code', () => {
            expect(Boom.isBoom(Boom.notFound(), 503)).toBe(false);
            expect(Boom.isBoom(Boom10.notFound(), 503)).toBe(false);
        });

        it('works from legacy boom', () => {
            expect(Boom10.isBoom(new Boom.Boom('oops'))).toBe(true);
            expect(Boom10.isBoom(new Boom10.Boom('oops'))).toBe(true);
        });
    });

    describe('boomify()', () => {
        it('returns the same object when already boom', () => {
            const error = Boom.badRequest();
            expect(Boom.boomify(error)).toBe(error);
            expect(Boom.boomify(error, { statusCode: 444 })).toBe(error);
        });

        it('returns an error with info when constructed using another error', () => {
            const error = new Error('ka-boom');
            const err = Boom.boomify(error);
            expect(err.cause).toBe(error);
            expect(err.output).toEqual({
                statusCode: 500,
                payload: {
                    statusCode: 500,
                    error: 'Internal Server Error',
                    message: 'An internal server error occurred',
                },
                headers: {},
            });
            expect(err.data).toBeNull();
        });

        it('wraps a DOMException without touching its getters', () => {
            const error = new DOMException('kaboom', 'AbortError');
            const err = Boom.boomify(error, { statusCode: 400 });

            expect(err.cause).toBe(error);
            expect(err.output.payload.message).toBe('kaboom');
        });

        it('sets new message when none exists', () => {
            const error = new Error();
            const wrapped = Boom.boomify(error, { statusCode: 400, message: 'something bad' });
            expect(wrapped.message).toBe('something bad');
        });

        it('returns boom error unchanged', () => {
            const error = Boom.badRequest('Missing data', { type: 'user' });
            const boom = Boom.boomify(error);

            expect(boom).toBe(error);
            expect(error.data.type).toBe('user');
            expect(error.output.payload.message).toBe('Missing data');
            expect(error.output.statusCode).toBe(400);
        });

        it('defaults to 500', () => {
            const error = new Error('Missing data');
            const boom = Boom.boomify(error);

            expect(boom.cause).toBe(error);
            expect(boom.output.payload.message).toBe('An internal server error occurred');
            expect(boom.output.statusCode).toBe(500);
        });

        it('overrides message and statusCode', () => {
            const error = Boom.badRequest('Missing data', { type: 'user' });
            const boom = Boom.boomify(error, { message: 'Override message', statusCode: 599 });

            expect(boom).toBe(error);
            expect(error.data.type).toBe('user');
            expect(error.output.payload.message).toBe('Override message: Missing data');
            expect(error.output.statusCode).toBe(599);
        });

        it('overrides message', () => {
            const error = Boom.badRequest('Missing data', { type: 'user' });
            const boom = Boom.boomify(error, { message: 'Override message' });

            expect(boom).toBe(error);
            expect(error.data.type).toBe('user');
            expect(error.output.payload.message).toBe('Override message: Missing data');
            expect(error.output.statusCode).toBe(400);
        });

        it('overrides statusCode', () => {
            const error = Boom.badRequest('Missing data', { type: 'user' });
            const boom = Boom.boomify(error, { statusCode: 599 });

            expect(boom).toBe(error);
            expect(error.data.type).toBe('user');
            expect(error.output.payload.message).toBe('Missing data');
            expect(error.output.statusCode).toBe(599);
        });

        it('skips override', () => {
            const error = Boom.badRequest('Missing data', { type: 'user' });
            const boom = Boom.boomify(error, {
                message: 'Override message',
                statusCode: 599,
                override: false,
            });

            expect(boom).toBe(error);
            expect(error.data.type).toBe('user');
            expect(error.output.payload.message).toBe('Missing data');
            expect(error.output.statusCode).toBe(400);
        });

        it('initializes plain error', () => {
            const error = new Error('Missing data');
            const boom = Boom.boomify(error, {
                message: 'Override message',
                statusCode: 599,
                override: false,
            });

            expect(boom.cause).toBe(error);
            expect(boom.output.payload.message).toBe('Override message: Missing data');
            expect(boom.output.statusCode).toBe(599);
        });

        it('handles non-Error errors', () => {
            const boom = Boom.boomify(123, { message: 'Hello', statusCode: 400 });

            expect(boom.cause).toBe(123);
            expect(boom.output.payload.message).toBe('Hello: 123');
            expect(boom.output.statusCode).toBe(400);
        });

        it('only sets isServer when it is an own property', () => {
            const boom = Boom.boomify(new Boom.Boom());
            expect(boom.isServer).toBe(true);
            expect(Object.hasOwn(boom, 'isServer')).toBe(false);

            const Boom2 = class extends Boom.Boom {
                isServer = undefined;
            };

            const boom2 = Boom.boomify(new Boom2());
            expect(boom2.isServer).toBe(true);
            expect(Object.hasOwn(boom2, 'isServer')).toBe(true);
        });

        it('works with legacy boom', () => {
            const boom = Boom.boomify(new Boom10.Boom(null, { statusCode: 404 }), {
                statusCode: 501,
                message: 'Override',
            });

            expect(boom.cause).toBeUndefined();
            expect(boom.message).toBe('Override: Not Found');
            expect(boom.isServer).toBe(true);
            expect(Object.hasOwn(boom, 'isServer')).toBe(true);
            expect(boom.output.statusCode).toBe(501);

            const boom10 = Boom10.boomify(new Boom.Boom(null, { statusCode: 404 }), {
                statusCode: 501,
                message: 'Override',
            });

            expect(boom10.cause).toBeUndefined();
            expect(boom10.message).toBe('Override: Not Found');
            expect(boom10.isServer).toBe(true);
            expect(Object.hasOwn(boom10, 'isServer')).toBe(true);
            expect(boom10.output.statusCode).toBe(501);
        });
    });

    describe('create()', () => {
        it('does not set null message', () => {
            const error = Boom.unauthorized(null);
            expect(error.output.payload.message).toBe('Unauthorized');
            expect(error.isServer).toBe(false);
        });

        it('sets message and data', () => {
            const error = Boom.badRequest('Missing data', { type: 'user' });
            expect(error.data.type).toBe('user');
            expect(error.output.payload.message).toBe('Missing data');
        });
    });

    describe('initialize()', () => {
        it('does not set null message', () => {
            const err = new Error('some error');
            const boom = new Boom.Boom('prepended error message', { statusCode: 400, cause: err });
            expect(boom.output.payload.message).toBe('prepended error message: some error');
        });
    });

    describe('isBoom', () => {
        it('is true for Boom object', () => {
            expect(Boom.badRequest().isBoom).toBe(true);
        });
    });

    const utilities = [
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

        // 500s
        'internal',
        'notImplemented',
        'badGateway',
        'serverUnavailable',
        'gatewayTimeout',
        'badImplementation',
    ];

    describe('badRequest()', () => {
        it('returns a 400 error statusCode', () => {
            const error = Boom.badRequest();

            expect(error.output.statusCode).toBe(400);
            expect(error.isServer).toBe(false);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.badRequest('my message').message).toBe('my message');
        });

        it('sets the message to HTTP status if none provided', () => {
            expect(Boom.badRequest().message).toBe('Bad Request');
        });
    });

    describe('unauthorized()', () => {
        it('returns a 401 error statusCode', () => {
            const err = Boom.unauthorized();
            expect(err.output.statusCode).toBe(401);
            expect(err.output.headers).toEqual({});
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.unauthorized('my message').message).toBe('my message');
        });

        it('returns a WWW-Authenticate header when passed a scheme', () => {
            const err = Boom.unauthorized('boom', 'Test');
            expect(err.output.statusCode).toBe(401);
            expect(err.output.headers['WWW-Authenticate']).toBe('Test error="boom"');
        });

        it('returns a WWW-Authenticate header when passed a scheme (no message)', () => {
            const err = Boom.unauthorized(null, 'Test');
            expect(err.output.statusCode).toBe(401);
            expect(err.output.headers['WWW-Authenticate']).toBe('Test');
        });

        it('returns a WWW-Authenticate header set to the schema array value', () => {
            const err = Boom.unauthorized(null, ['Test', 'one', 'two']);
            expect(err.output.statusCode).toBe(401);
            expect(err.output.headers['WWW-Authenticate']).toBe('Test, one, two');
        });

        it('returns a WWW-Authenticate header when passed a scheme and attributes', () => {
            const err = Boom.unauthorized('boom', 'Test', { a: 1, b: 'something', c: null, d: 0 });
            expect(err.output.statusCode).toBe(401);
            expect(err.output.headers['WWW-Authenticate']).toBe('Test a="1", b="something", c="", d="0", error="boom"');
        });

        it('returns a WWW-Authenticate header when passed a scheme and empty attributes', () => {
            const err = Boom.unauthorized('boom', 'Test', {});
            expect(err.output.statusCode).toBe(401);
            expect(err.output.headers['WWW-Authenticate']).toBe('Test error="boom"');
        });

        it('returns a WWW-Authenticate header from string input instead of object', () => {
            const err = Boom.unauthorized(null, 'Negotiate', 'VGhpcyBpcyBhIHRlc3QgdG9rZW4=');
            expect(err.output.statusCode).toBe(401);
            expect(err.output.headers['WWW-Authenticate']).toBe('Negotiate VGhpcyBpcyBhIHRlc3QgdG9rZW4=');
        });

        it('returns a WWW-Authenticate header when passed attributes, missing error', () => {
            const err = Boom.unauthorized(null, 'Test', {
                a: 1,
                b: 'something',
                c: null,
                d: 0,
                e: undefined,
            });
            expect(err.output.statusCode).toBe(401);
            expect(err.output.headers['WWW-Authenticate']).toBe('Test a="1", b="something", c="", d="0", e=""');
            expect(err.isMissing).toBe(true);
        });

        it('sets the isMissing flag when error message is empty', () => {
            const err = Boom.unauthorized('', 'Basic');
            expect(err.isMissing).toBe(true);
        });

        it('does not set the isMissing flag when error message is not empty', () => {
            const err = Boom.unauthorized('message', 'Basic');
            expect(err.isMissing).toBeUndefined();
        });

        it('sets a WWW-Authenticate when passed as an array', () => {
            const err = Boom.unauthorized('message', ['Basic', 'Example e="1"', 'Another x="3", y="4"']);
            expect(err.output.headers['WWW-Authenticate']).toBe('Basic, Example e="1", Another x="3", y="4"');
        });
    });

    describe('paymentRequired()', () => {
        it('returns a 402 error statusCode', () => {
            expect(Boom.paymentRequired().output.statusCode).toBe(402);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.paymentRequired('my message').message).toBe('my message');
        });

        it('sets the message to HTTP status if none provided', () => {
            expect(Boom.paymentRequired().message).toBe('Payment Required');
        });
    });

    describe('methodNotAllowed()', () => {
        it('returns a 405 error statusCode', () => {
            expect(Boom.methodNotAllowed().output.statusCode).toBe(405);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.methodNotAllowed('my message').message).toBe('my message');
        });

        it('returns an Allow header when passed a string', () => {
            const err = Boom.methodNotAllowed('my message', null, 'GET');
            expect(err.output.statusCode).toBe(405);
            expect(err.output.headers.Allow).toBe('GET');
        });

        it('returns an Allow header when passed an array', () => {
            const err = Boom.methodNotAllowed('my message', null, ['GET', 'POST']);
            expect(err.output.statusCode).toBe(405);
            expect(err.output.headers.Allow).toBe('GET, POST');
        });
    });

    describe('notAcceptable()', () => {
        it('returns a 406 error statusCode', () => {
            expect(Boom.notAcceptable().output.statusCode).toBe(406);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.notAcceptable('my message').message).toBe('my message');
        });
    });

    describe('proxyAuthRequired()', () => {
        it('returns a 407 error statusCode', () => {
            expect(Boom.proxyAuthRequired().output.statusCode).toBe(407);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.proxyAuthRequired('my message').message).toBe('my message');
        });
    });

    describe('clientTimeout()', () => {
        it('returns a 408 error statusCode', () => {
            expect(Boom.clientTimeout().output.statusCode).toBe(408);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.clientTimeout('my message').message).toBe('my message');
        });
    });

    describe('conflict()', () => {
        it('returns a 409 error statusCode', () => {
            expect(Boom.conflict().output.statusCode).toBe(409);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.conflict('my message').message).toBe('my message');
        });
    });

    describe('resourceGone()', () => {
        it('returns a 410 error statusCode', () => {
            expect(Boom.resourceGone().output.statusCode).toBe(410);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.resourceGone('my message').message).toBe('my message');
        });
    });

    describe('lengthRequired()', () => {
        it('returns a 411 error statusCode', () => {
            expect(Boom.lengthRequired().output.statusCode).toBe(411);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.lengthRequired('my message').message).toBe('my message');
        });
    });

    describe('preconditionFailed()', () => {
        it('returns a 412 error statusCode', () => {
            expect(Boom.preconditionFailed().output.statusCode).toBe(412);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.preconditionFailed('my message').message).toBe('my message');
        });
    });

    describe('entityTooLarge()', () => {
        it('returns a 413 error statusCode', () => {
            expect(Boom.entityTooLarge().output.statusCode).toBe(413);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.entityTooLarge('my message').message).toBe('my message');
        });
    });

    describe('uriTooLong()', () => {
        it('returns a 414 error statusCode', () => {
            expect(Boom.uriTooLong().output.statusCode).toBe(414);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.uriTooLong('my message').message).toBe('my message');
        });
    });

    describe('unsupportedMediaType()', () => {
        it('returns a 415 error statusCode', () => {
            expect(Boom.unsupportedMediaType().output.statusCode).toBe(415);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.unsupportedMediaType('my message').message).toBe('my message');
        });
    });

    describe('rangeNotSatisfiable()', () => {
        it('returns a 416 error statusCode', () => {
            expect(Boom.rangeNotSatisfiable().output.statusCode).toBe(416);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.rangeNotSatisfiable('my message').message).toBe('my message');
        });
    });

    describe('expectationFailed()', () => {
        it('returns a 417 error statusCode', () => {
            expect(Boom.expectationFailed().output.statusCode).toBe(417);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.expectationFailed('my message').message).toBe('my message');
        });
    });

    describe('teapot()', () => {
        it('returns a 418 error statusCode', () => {
            expect(Boom.teapot().output.statusCode).toBe(418);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.teapot('Sorry, no coffee...').message).toBe('Sorry, no coffee...');
        });
    });

    describe('badData()', () => {
        it('returns a 422 error statusCode', () => {
            expect(Boom.badData().output.statusCode).toBe(422);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.badData('my message').message).toBe('my message');
        });
    });

    describe('locked()', () => {
        it('returns a 423 error statusCode', () => {
            expect(Boom.locked().output.statusCode).toBe(423);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.locked('my message').message).toBe('my message');
        });
    });

    describe('failedDependency()', () => {
        it('returns a 424 error statusCode', () => {
            expect(Boom.failedDependency().output.statusCode).toBe(424);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.failedDependency('my message').message).toBe('my message');
        });
    });

    describe('tooEarly()', () => {
        it('returns a 425 error statusCode', () => {
            expect(Boom.tooEarly().output.statusCode).toBe(425);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.tooEarly('my message').message).toBe('my message');
        });
    });

    describe('preconditionRequired()', () => {
        it('returns a 428 error statusCode', () => {
            expect(Boom.preconditionRequired().output.statusCode).toBe(428);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.preconditionRequired('my message').message).toBe('my message');
        });
    });

    describe('tooManyRequests()', () => {
        it('returns a 429 error statusCode', () => {
            expect(Boom.tooManyRequests().output.statusCode).toBe(429);
        });

        it('sets the message with the passed-in message', () => {
            expect(Boom.tooManyRequests('my message').message).toBe('my message');
        });
    });

    describe('illegal()', () => {
        it('returns a 451 error statusCode', () => {
            expect(Boom.illegal().output.statusCode).toBe(451);
        });

        it('sets the message with the passed-in message', () => {
            expect(Boom.illegal('my message').message).toBe('my message');
        });
    });

    describe('serverUnavailable()', () => {
        it('returns a 503 error statusCode', () => {
            expect(Boom.serverUnavailable().output.statusCode).toBe(503);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.serverUnavailable('my message').message).toBe('my message');
        });
    });

    describe('forbidden()', () => {
        it('returns a 403 error statusCode', () => {
            expect(Boom.forbidden().output.statusCode).toBe(403);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.forbidden('my message').message).toBe('my message');
        });
    });

    describe('notFound()', () => {
        it('returns a 404 error statusCode', () => {
            expect(Boom.notFound().output.statusCode).toBe(404);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.notFound('my message').message).toBe('my message');
        });
    });

    describe('internal()', () => {
        it('returns a 500 error statusCode', () => {
            expect(Boom.internal().output.statusCode).toBe(500);
        });

        it('handles a custom error statusCode', () => {
            const err = Boom.internal(null, null, 507);
            expect(err.output.statusCode).toBe(507);
            expect(err.message).toBe('Insufficient Storage');
        });

        it('sets the message with the passed in message', () => {
            const err = Boom.internal('my message');
            expect(err.message).toBe('my message');
            expect(err.isServer).toBe(true);
            expect(err.output.payload.message).toBe('An internal server error occurred');
        });

        it('passes data on the callback if its passed in', () => {
            expect(Boom.internal('my message', { my: 'data' }).data.my).toBe('data');
        });

        it('uses data with Error as cause', () => {
            const insideErr = new Error('inside');
            const err = Boom.internal('my message', insideErr);
            expect(err.data).toBeNull();
            expect(err.cause).toBe(insideErr);
        });

        it('returns an error with composite message', () => {
            const x = {};

            try {
                x.foo();
            } catch (err) {
                const boom = Boom.internal('Something bad', err);
                boom.reformat(true);
                expect(boom.message).toBe('Something bad');
                expect(boom.cause).toBeInstanceOf(TypeError);
                expect(boom.cause.message).toBe('x.foo is not a function');
                expect(boom.output.payload.message).toBe('Something bad: x.foo is not a function');
                expect(boom.isServer).toBe(true);
            }
        });
    });

    describe('notImplemented()', () => {
        it('returns a 501 error statusCode', () => {
            expect(Boom.notImplemented().output.statusCode).toBe(501);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.notImplemented('my message').message).toBe('my message');
        });

        it('uses data with Error as cause', () => {
            const insideErr = new Error('inside');
            const err = Boom.notImplemented('my message', insideErr);
            expect(err.data).toBeNull();
            expect(err.cause).toBe(insideErr);
        });
    });

    describe('badGateway()', () => {
        it('returns a 502 error statusCode', () => {
            expect(Boom.badGateway().output.statusCode).toBe(502);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.badGateway('my message').message).toBe('my message');
        });

        it('retains source boom error as data when wrapped', () => {
            const upstream = Boom.serverUnavailable();
            const boom = Boom.badGateway('Upstream error', upstream);
            expect(boom.output.statusCode).toBe(502);
            expect(boom.data).toBe(upstream);
        });

        it('uses data with Error as cause', () => {
            const insideErr = new Error('inside');
            const err = Boom.badGateway('my message', insideErr);
            expect(err.data).toBeNull();
            expect(err.cause).toBe(insideErr);
        });
    });

    describe('gatewayTimeout()', () => {
        it('returns a 504 error statusCode', () => {
            expect(Boom.gatewayTimeout().output.statusCode).toBe(504);
        });

        it('sets the message with the passed in message', () => {
            expect(Boom.gatewayTimeout('my message').message).toBe('my message');
        });

        it('uses data with Error as cause', () => {
            const insideErr = new Error('inside');
            const err = Boom.gatewayTimeout('my message', insideErr);
            expect(err.data).toBeNull();
            expect(err.cause).toBe(insideErr);
        });
    });

    describe('badImplementation()', () => {
        it('returns a 500 error statusCode', () => {
            const err = Boom.badImplementation();
            expect(err.output.statusCode).toBe(500);
            expect(err.isDeveloperError).toBe(true);
            expect(err.isServer).toBe(true);
        });

        it('hides error from user when error data is included', () => {
            const err = Boom.badImplementation('Invalid', new Error('kaboom'));
            expect(err.output).toEqual({
                headers: {},
                statusCode: 500,
                payload: {
                    error: 'Internal Server Error',
                    message: 'An internal server error occurred',
                    statusCode: 500,
                },
            });
        });

        it('hides error from user when error data is included (boom)', () => {
            const err = Boom.badImplementation('Invalid', Boom.badRequest('kaboom'));
            expect(err.isDeveloperError).toBe(true);
            expect(err.output).toEqual({
                headers: {},
                statusCode: 500,
                payload: {
                    error: 'Internal Server Error',
                    message: 'An internal server error occurred',
                    statusCode: 500,
                },
            });
        });

        it('uses data with Error as cause', () => {
            const insideErr = new Error('inside');
            const err = Boom.badImplementation('my message', insideErr);
            expect(err.data).toBeNull();
            expect(err.cause).toBe(insideErr);
        });
    });

    describe('stack trace', () => {
        it('should omit src', () => {
            for (const name of utilities) {
                const err = Boom[name]();
                expect(err.stack).not.toMatch(/(\/|\\)src(\/|\\)index\.js/);
            }
        });

        it('should not crash when Error.captureStackTrace is missing', () => {
            const captureStackTrace = Error.captureStackTrace;

            for (const name of utilities) {
                let err;

                try {
                    Error.captureStackTrace = undefined;
                    err = Boom[name]();
                } finally {
                    Error.captureStackTrace = captureStackTrace;
                }

                expect(err.stack).toMatch(/(\/|\\)src(\/|\\)index\.js/);
            }
        });
    });

    describe('method with error object instead of message', () => {
        it.each(utilities)('%s uses stringified error as message', (name) => {
            const error = new Error('An example mongoose validation error');
            error.name = 'ValidationError';
            const err = Boom[name](error);
            expect(err.cause).toBeUndefined();
            expect(err.message).toBe(error.toString());
        });
    });

    describe('reformat()', () => {
        it('displays internal server error messages in debug mode', () => {
            const error = new Error('ka-boom');
            const err = new Boom.Boom(null, { statusCode: 500, cause: error });

            err.reformat(false);
            expect(err.output).toEqual({
                statusCode: 500,
                payload: {
                    statusCode: 500,
                    error: 'Internal Server Error',
                    message: 'An internal server error occurred',
                },
                headers: {},
            });

            err.reformat(true);
            expect(err.output).toEqual({
                statusCode: 500,
                payload: {
                    statusCode: 500,
                    error: 'Internal Server Error',
                    message: 'ka-boom',
                },
                headers: {},
            });
        });

        it('is redefinable', () => {
            Object.defineProperty(new Boom.Boom('oops'), 'reformat', { value: true });
        });

        it('can be implemented by subclasses to apply custom formatting', () => {
            class MyBoom extends Boom.Boom {
                reformat(...args) {
                    super.reformat(...args);

                    this.output.payload.custom = true;
                }
            }

            const err = new MyBoom('boom', { statusCode: 400 });
            expect(err.output.statusCode).toBe(400);
            expect(err.output.payload.message).toBe('boom');
            expect(err.output.payload.custom).toBe(true);

            err.output.statusCode = 500;
            err.reformat();
            expect(err.output.statusCode).toBe(500);
            expect(err.output.payload.message).toBe('An internal server error occurred');
            expect(err.output.payload.custom).toBe(true);
        });

        it('prototype can be changed to always debug', () => {
            const proto = Boom.Boom.prototype.reformat;

            onTestFinished(() => {
                Boom.Boom.prototype.reformat = proto;
            });

            Boom.Boom.prototype.reformat = function () {
                return proto.call(this, true);
            };

            expect(Boom.internal('DEBUG').output.payload.message).toBe('DEBUG');
        });
    });
});

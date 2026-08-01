import { describe, expectTypeOf, it } from 'vitest';

import * as Boom from '../src/index.js';

describe('typings', () => {
    describe('Boom', () => {
        it('accepts valid calls', () => {
            expectTypeOf(new Boom.Boom()).toExtend<Error>();
            expectTypeOf(new Boom.Boom('error')).toExtend<Boom.Boom<unknown>>();
            expectTypeOf(new Boom.Boom('error', { data: true })).toExtend<Boom.Boom<boolean>>();
            expectTypeOf(new Boom.Boom<undefined>('error')).toExtend<Boom.Boom<undefined>>();
            expectTypeOf(new Boom.Boom<boolean>('error', { data: true })).toExtend<Boom.Boom<boolean>>();

            class CustomError extends Boom.Boom {}
            expectTypeOf(new CustomError('Some error')).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            new Boom.Boom(null);
            // @ts-expect-error message must be a string
            new Boom.Boom(new Error('error'));
            // @ts-expect-error data is required when Data is set
            new Boom.Boom<string>('error');
            // @ts-expect-error data must match Data
            new Boom.Boom<string>('error', { data: true });
        });

        it('exposes a writable output', () => {
            const boom = new Boom.Boom('some error');
            expectTypeOf(boom.output).toEqualTypeOf<Boom.Output>();

            boom.output.payload.custom_null = null;
            boom.output.payload.custom_number = 42;
            boom.output.payload.custom_string = 'foo';
            boom.output.payload.custom_boolean = true;
            boom.output.payload.custom_object = { bar: 42 };
            boom.output.headers['header1'] = 'foo';
            boom.output.headers['header2'] = ['foo', 'bar'];
            boom.output.headers['header3'] = 42;
            boom.output.headers['header4'] = undefined;

            expectTypeOf(boom.output.payload).toExtend<Boom.Payload>();
            expectTypeOf(boom.output.headers).toEqualTypeOf<Boom.Output['headers']>();
        });
    });

    describe('boomify()', () => {
        const error = new Error('Unexpected input');

        class BadaBoom extends Boom.Boom<number> {
            constructor() {
                super('boom', { data: 1 });
            }
        }

        it('accepts valid calls', () => {
            expectTypeOf(Boom.boomify(error)).toExtend<Boom.Boom>();
            expectTypeOf(Boom.boomify(error, { statusCode: 400 })).toExtend<Boom.Boom>();
            expectTypeOf(
                Boom.boomify(error, { statusCode: 400, message: 'Unexpected Input', override: false }),
            ).toExtend<Boom.Boom>();
            expectTypeOf(Boom.boomify('error')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.boomify(new Boom.Boom<{ foo: 'bar' }>('error', { data: { foo: 'bar' } }))).toExtend<
                Boom.Boom<{ foo: 'bar' }>
            >();
            expectTypeOf(Boom.boomify(error, { data: 'bla' })).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.boomify<Boom.Boom<string>>(error, { data: 'bla' })).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.boomify(new BadaBoom(), { statusCode: 400 })).toExtend<BadaBoom>();
            expectTypeOf(Boom.boomify(new BadaBoom(), { statusCode: 400 })).toExtend<Boom.Boom<number>>();
            expectTypeOf(Boom.boomify(new BadaBoom(), { data: 'bla' }).data).toEqualTypeOf<string>();

            expectTypeOf(Boom.boomify(new Boom.Boom<string>('error', { data: 'ok' }))).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.boomify(new Boom.Boom<string>('error', { data: 'ok' }), { data: 1 })).toExtend<
                Boom.Boom<number>
            >();
            expectTypeOf(
                Boom.boomify<Boom.Boom<number>>(new Boom.Boom<string>('error', { data: 'ok' }), { data: 1 }),
            ).toExtend<Boom.Boom<number>>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error requires an error
            Boom.boomify();
            // @ts-expect-error statusCode must be a number
            Boom.boomify(error, { statusCode: '400' });
            // @ts-expect-error message must be a string
            Boom.boomify(error, { statusCode: 400, message: true });
            // @ts-expect-error override must be a boolean
            Boom.boomify(error, { statusCode: 400, override: 'false' });
            // @ts-expect-error unknown option
            Boom.boomify(error, { decorate: { x: 'y' } });

            // Cannot work without partial type inference (https://github.com/microsoft/TypeScript/issues/26242)
            // Boom.boomify<Boom.Boom<number>>(new Boom.Boom<string>('error', { data: 'ok' }));
        });
    });

    describe('isBoom()', () => {
        const error = new Error('Unexpected input');

        it('accepts valid calls', () => {
            expectTypeOf(Boom.boomify(error).isBoom).toEqualTypeOf<boolean>();

            expectTypeOf(Boom.isBoom(error)).toBeBoolean();
            expectTypeOf(Boom.isBoom(error, 404)).toBeBoolean();
            expectTypeOf(Boom.isBoom(Boom.boomify(error))).toBeBoolean();
            expectTypeOf(Boom.isBoom('error')).toBeBoolean();
            expectTypeOf(Boom.isBoom({ foo: 'bar' })).toBeBoolean();
            expectTypeOf(Boom.isBoom({ error: true })).toBeBoolean();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error statusCode must be a number
            Boom.isBoom(error, 'test');
            // @ts-expect-error requires an object
            Boom.isBoom();
        });
    });

    // 4xx Errors

    describe('badRequest()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.badRequest('invalid query', 'some data')).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.badRequest('invalid query', { foo: 'bar' })).toExtend<Boom.Boom<{ foo: string }>>();
            expectTypeOf(Boom.badRequest('invalid query')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.badRequest()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.badRequest(400);
            // @ts-expect-error message must be a string
            Boom.badRequest({ foo: 'bar' });
            // @ts-expect-error message must be a string
            Boom.badRequest(new Error());
        });
    });

    describe('unauthorized()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.unauthorized('invalid password')).toExtend<Boom.Boom<null>>();
            expectTypeOf(Boom.unauthorized('invalid password', 'simple')).toExtend<Boom.Boom<null>>();
            expectTypeOf(Boom.unauthorized(null, 'Negotiate', 'VGhpcyBpcyBhIHRlc3QgdG9rZW4=')).toExtend<
                Boom.Boom<null>
            >();
            expectTypeOf(Boom.unauthorized('invalid password', 'sample', { ttl: 0, cache: null, foo: 'bar' })).toExtend<
                Boom.Boom<null>
            >();
            expectTypeOf(
                Boom.unauthorized('invalid password', 'sample', {
                    ttl: 0,
                    cache: null,
                    foo: 'bar',
                } as Boom.unauthorized.Attributes),
            ).toExtend<Boom.Boom<null>>();
            expectTypeOf(Boom.unauthorized()).toExtend<Boom.Boom<null>>();
            expectTypeOf(Boom.unauthorized('basic', ['a', 'b', 'c'])).toExtend<Boom.Boom<null>>();
            expectTypeOf(Boom.unauthorized('', 'basic')).toExtend<Boom.Boom<null> & Boom.unauthorized.MissingAuth>();
            expectTypeOf(Boom.unauthorized(null, 'basic')).toExtend<Boom.Boom<null> & Boom.unauthorized.MissingAuth>();
            expectTypeOf(Boom.unauthorized('', 'basic').isMissing).toEqualTypeOf<true>();
            expectTypeOf(Boom.unauthorized(null, 'basic').isMissing).toEqualTypeOf<true>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.unauthorized(401);
            try {
                // @ts-expect-error scheme must be a string or an array
                Boom.unauthorized('invalid password', 500);
            } catch {}
            // @ts-expect-error attributes must be a string or an object
            Boom.unauthorized('invalid password', 'sample', 500);
            // @ts-expect-error attributes are not supported with an array of schemes
            Boom.unauthorized('basic', ['a', 'b', 'c'], 'test');
            // @ts-expect-error isMissing is only set when the message is empty
            Boom.unauthorized('message', 'basic').isMissing;
        });
    });

    describe('paymentRequired()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.paymentRequired('bandwidth used', 'some data')).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.paymentRequired('bandwidth used', { foo: 'bar' })).toExtend<Boom.Boom<{ foo: string }>>();
            expectTypeOf(Boom.paymentRequired('bandwidth used')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.paymentRequired()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.paymentRequired(402);
            // @ts-expect-error message must be a string
            Boom.paymentRequired({ foo: 'bar' });
        });
    });

    describe('forbidden()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.forbidden('try again some time', 'some data')).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.forbidden('try again some time', { foo: 'bar' })).toExtend<Boom.Boom<{ foo: string }>>();
            expectTypeOf(Boom.forbidden('try again some time')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.forbidden()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.forbidden(403);
            // @ts-expect-error message must be a string
            Boom.forbidden({ foo: 'bar' });
        });
    });

    describe('notFound()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.notFound('missing', 'some data')).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.notFound('missing', { foo: 'bar' })).toExtend<Boom.Boom<{ foo: string }>>();
            expectTypeOf(Boom.notFound('missing')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.notFound()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.notFound(404);
            // @ts-expect-error message must be a string
            Boom.notFound({ foo: 'bar' });
        });
    });

    describe('methodNotAllowed()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.methodNotAllowed('this method is not allowed', 'some data')).toExtend<
                Boom.Boom<string>
            >();
            expectTypeOf(Boom.methodNotAllowed('this method is not allowed', { foo: 'bar' })).toExtend<
                Boom.Boom<{ foo: string }>
            >();
            expectTypeOf(Boom.methodNotAllowed('this method is not allowed')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.methodNotAllowed()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.methodNotAllowed(405);
            // @ts-expect-error message must be a string
            Boom.methodNotAllowed({ foo: 'bar' });
        });
    });

    describe('notAcceptable()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.notAcceptable('unacceptable', 'some data')).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.notAcceptable('unacceptable', { foo: 'bar' })).toExtend<Boom.Boom<{ foo: string }>>();
            expectTypeOf(Boom.notAcceptable('unacceptable')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.notAcceptable()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.notAcceptable(406);
            // @ts-expect-error message must be a string
            Boom.notAcceptable({ foo: 'bar' });
        });
    });

    describe('proxyAuthRequired()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.proxyAuthRequired('auth missing', 'some data')).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.proxyAuthRequired('auth missing', { foo: 'bar' })).toExtend<Boom.Boom<{ foo: string }>>();
            expectTypeOf(Boom.proxyAuthRequired('auth missing')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.proxyAuthRequired()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.proxyAuthRequired(407);
            // @ts-expect-error message must be a string
            Boom.proxyAuthRequired({ foo: 'bar' });
        });
    });

    describe('clientTimeout()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.clientTimeout('timed out', 'some data')).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.clientTimeout('timed out', { foo: 'bar' })).toExtend<Boom.Boom<{ foo: string }>>();
            expectTypeOf(Boom.clientTimeout('timed out')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.clientTimeout()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.clientTimeout(408);
            // @ts-expect-error message must be a string
            Boom.clientTimeout({ foo: 'bar' });
        });
    });

    describe('conflict()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.conflict('there was a conflict', 'some data')).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.conflict('there was a conflict', { foo: 'bar' })).toExtend<Boom.Boom<{ foo: string }>>();
            expectTypeOf(Boom.conflict('there was a conflict')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.conflict()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.conflict(409);
            // @ts-expect-error message must be a string
            Boom.conflict({ foo: 'bar' });
        });
    });

    describe('resourceGone()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.resourceGone('it is gone', 'some data')).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.resourceGone('it is gone', { foo: 'bar' })).toExtend<Boom.Boom<{ foo: string }>>();
            expectTypeOf(Boom.resourceGone('it is gone')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.resourceGone()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.resourceGone(410);
            // @ts-expect-error message must be a string
            Boom.resourceGone({ foo: 'bar' });
        });
    });

    describe('lengthRequired()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.lengthRequired('length needed', 'some data')).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.lengthRequired('length needed', { foo: 'bar' })).toExtend<Boom.Boom<{ foo: string }>>();
            expectTypeOf(Boom.lengthRequired('length needed')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.lengthRequired()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.lengthRequired(411);
            // @ts-expect-error message must be a string
            Boom.lengthRequired({ foo: 'bar' });
        });
    });

    describe('preconditionFailed()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.preconditionFailed('failed', 'some data')).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.preconditionFailed('failed', { foo: 'bar' })).toExtend<Boom.Boom<{ foo: string }>>();
            expectTypeOf(Boom.preconditionFailed('failed')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.preconditionFailed()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.preconditionFailed(412);
            // @ts-expect-error message must be a string
            Boom.preconditionFailed({ foo: 'bar' });
        });
    });

    describe('entityTooLarge()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.entityTooLarge('too big', 'some data')).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.entityTooLarge('too big', { foo: 'bar' })).toExtend<Boom.Boom<{ foo: string }>>();
            expectTypeOf(Boom.entityTooLarge('too big')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.entityTooLarge()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.entityTooLarge(413);
            // @ts-expect-error message must be a string
            Boom.entityTooLarge({ foo: 'bar' });
        });
    });

    describe('uriTooLong()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.uriTooLong('uri is too long', 'some data')).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.uriTooLong('uri is too long', { foo: 'bar' })).toExtend<Boom.Boom<{ foo: string }>>();
            expectTypeOf(Boom.uriTooLong('uri is too long')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.uriTooLong()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.uriTooLong(414);
            // @ts-expect-error message must be a string
            Boom.uriTooLong({ foo: 'bar' });
        });
    });

    describe('unsupportedMediaType()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.unsupportedMediaType('that media is not supported', 'some data')).toExtend<
                Boom.Boom<string>
            >();
            expectTypeOf(Boom.unsupportedMediaType('that media is not supported', { foo: 'bar' })).toExtend<
                Boom.Boom<{ foo: string }>
            >();
            expectTypeOf(Boom.unsupportedMediaType('that media is not supported')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.unsupportedMediaType()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.unsupportedMediaType(415);
            // @ts-expect-error message must be a string
            Boom.unsupportedMediaType({ foo: 'bar' });
        });
    });

    describe('rangeNotSatisfiable()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.rangeNotSatisfiable('range not satisfiable', 'some data')).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.rangeNotSatisfiable('range not satisfiable', { foo: 'bar' })).toExtend<
                Boom.Boom<{ foo: string }>
            >();
            expectTypeOf(Boom.rangeNotSatisfiable('range not satisfiable')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.rangeNotSatisfiable()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.rangeNotSatisfiable(416);
            // @ts-expect-error message must be a string
            Boom.rangeNotSatisfiable({ foo: 'bar' });
        });
    });

    describe('expectationFailed()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.expectationFailed('expected this to work', 'some data')).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.expectationFailed('expected this to work', { foo: 'bar' })).toExtend<
                Boom.Boom<{ foo: string }>
            >();
            expectTypeOf(Boom.expectationFailed('expected this to work')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.expectationFailed()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.expectationFailed(417);
            // @ts-expect-error message must be a string
            Boom.expectationFailed({ foo: 'bar' });
        });
    });

    describe('teapot()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.teapot('sorry, no coffee...', 'some data')).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.teapot('sorry, no coffee...', { foo: 'bar' })).toExtend<Boom.Boom<{ foo: string }>>();
            expectTypeOf(Boom.teapot('sorry, no coffee...')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.teapot()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.teapot(418);
            // @ts-expect-error message must be a string
            Boom.teapot({ foo: 'bar' });
        });
    });

    describe('badData()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.badData('your data is bad and you should feel bad', 'some data')).toExtend<
                Boom.Boom<string>
            >();
            expectTypeOf(Boom.badData('your data is bad and you should feel bad', { foo: 'bar' })).toExtend<
                Boom.Boom<{ foo: string }>
            >();
            expectTypeOf(Boom.badData('your data is bad and you should feel bad')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.badData()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.badData(422);
            // @ts-expect-error message must be a string
            Boom.badData({ foo: 'bar' });
        });
    });

    describe('locked()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.locked('this resource has been locked', 'some data')).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.locked('this resource has been locked', { foo: 'bar' })).toExtend<
                Boom.Boom<{ foo: string }>
            >();
            expectTypeOf(Boom.locked('this resource has been locked')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.locked()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.locked(423);
            // @ts-expect-error message must be a string
            Boom.locked({ foo: 'bar' });
        });
    });

    describe('failedDependency()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.failedDependency('an external resource failed', 'some data')).toExtend<
                Boom.Boom<string>
            >();
            expectTypeOf(Boom.failedDependency('an external resource failed', { foo: 'bar' })).toExtend<
                Boom.Boom<{ foo: string }>
            >();
            expectTypeOf(Boom.failedDependency('an external resource failed')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.failedDependency()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.failedDependency(424);
            // @ts-expect-error message must be a string
            Boom.failedDependency({ foo: 'bar' });
        });
    });

    describe('tooEarly()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.tooEarly("won't process your request", 'some data')).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.tooEarly("won't process your request", { foo: 'bar' })).toExtend<
                Boom.Boom<{ foo: string }>
            >();
            expectTypeOf(Boom.tooEarly("won't process your request")).toExtend<Boom.Boom>();
            expectTypeOf(Boom.tooEarly()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.tooEarly(425);
            // @ts-expect-error message must be a string
            Boom.tooEarly({ foo: 'bar' });
        });
    });

    describe('preconditionRequired()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.preconditionRequired('you must supple an If-Match header', 'some data')).toExtend<
                Boom.Boom<string>
            >();
            expectTypeOf(Boom.preconditionRequired('you must supple an If-Match header', { foo: 'bar' })).toExtend<
                Boom.Boom<{ foo: string }>
            >();
            expectTypeOf(Boom.preconditionRequired('you must supple an If-Match header')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.preconditionRequired()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.preconditionRequired(428);
            // @ts-expect-error message must be a string
            Boom.preconditionRequired({ foo: 'bar' });
        });
    });

    describe('tooManyRequests()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.tooManyRequests('you have exceeded your request limit', 'some data')).toExtend<
                Boom.Boom<string>
            >();
            expectTypeOf(Boom.tooManyRequests('you have exceeded your request limit', { foo: 'bar' })).toExtend<
                Boom.Boom<{ foo: string }>
            >();
            expectTypeOf(Boom.tooManyRequests('you have exceeded your request limit')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.tooManyRequests()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.tooManyRequests(414);
            // @ts-expect-error message must be a string
            Boom.tooManyRequests({ foo: 'bar' });
        });
    });

    describe('illegal()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(
                Boom.illegal('you are not permitted to view this resource for legal reasons', 'some data'),
            ).toExtend<Boom.Boom<string>>();
            expectTypeOf(
                Boom.illegal('you are not permitted to view this resource for legal reasons', { foo: 'bar' }),
            ).toExtend<Boom.Boom<{ foo: string }>>();
            expectTypeOf(
                Boom.illegal('you are not permitted to view this resource for legal reasons'),
            ).toExtend<Boom.Boom>();
            expectTypeOf(Boom.illegal()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.illegal(451);
            // @ts-expect-error message must be a string
            Boom.illegal({ foo: 'bar' });
        });
    });

    // 5xx Errors

    describe('internal()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.internal('terrible implementation', 'some data', 599)).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.internal('terrible implementation', { foo: 'bar' })).toExtend<
                Boom.Boom<{ foo: string }>
            >();
            expectTypeOf(Boom.internal('terrible implementation')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.internal()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.internal(500);
            // @ts-expect-error message must be a string
            Boom.internal({ foo: 'bar' });
        });
    });

    describe('badImplementation()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.badImplementation('terrible implementation', 'some data')).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.badImplementation('terrible implementation', { foo: 'bar' })).toExtend<
                Boom.Boom<{ foo: string }>
            >();
            expectTypeOf(Boom.badImplementation('terrible implementation')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.badImplementation()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.badImplementation(500);
            // @ts-expect-error message must be a string
            Boom.badImplementation({ foo: 'bar' });
        });
    });

    describe('notImplemented()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.notImplemented('method not implemented', 'some data')).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.notImplemented('method not implemented', { foo: 'bar' })).toExtend<
                Boom.Boom<{ foo: string }>
            >();
            expectTypeOf(Boom.notImplemented('method not implemented')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.notImplemented()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.notImplemented(501);
            // @ts-expect-error message must be a string
            Boom.notImplemented({ foo: 'bar' });
        });
    });

    describe('badGateway()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.badGateway('this is a bad gateway', 'some data')).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.badGateway('this is a bad gateway', { foo: 'bar' })).toExtend<
                Boom.Boom<{ foo: string }>
            >();
            expectTypeOf(Boom.badGateway('this is a bad gateway')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.badGateway()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.badGateway(502);
            // @ts-expect-error message must be a string
            Boom.badGateway({ foo: 'bar' });
        });
    });

    describe('serverUnavailable()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.serverUnavailable('unavailable', 'some data')).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.serverUnavailable('unavailable', { foo: 'bar' })).toExtend<Boom.Boom<{ foo: string }>>();
            expectTypeOf(Boom.serverUnavailable('unavailable')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.serverUnavailable()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.serverUnavailable(503);
            // @ts-expect-error message must be a string
            Boom.serverUnavailable({ foo: 'bar' });
        });
    });

    describe('gatewayTimeout()', () => {
        it('accepts valid calls', () => {
            expectTypeOf(Boom.gatewayTimeout('gateway timeout', 'some data')).toExtend<Boom.Boom<string>>();
            expectTypeOf(Boom.gatewayTimeout('gateway timeout', { foo: 'bar' })).toExtend<Boom.Boom<{ foo: string }>>();
            expectTypeOf(Boom.gatewayTimeout('gateway timeout')).toExtend<Boom.Boom>();
            expectTypeOf(Boom.gatewayTimeout()).toExtend<Boom.Boom>();
        });

        it('rejects invalid calls', () => {
            // @ts-expect-error message must be a string
            Boom.gatewayTimeout(504);
            // @ts-expect-error message must be a string
            Boom.gatewayTimeout({ foo: 'bar' });
        });
    });
});

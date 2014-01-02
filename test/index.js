// Load modules

var Lab = require('lab');
var Boom = require('../lib');
var Util = require('util');

// Declare internals

var internals = {};


// Test shortcuts

var expect = Lab.expect;
var before = Lab.before;
var after = Lab.after;
var describe = Lab.experiment;
var it = Lab.test;


describe('Boom', function () {

    it('returns an error with info when constructed using another error', function (done) {

        var error = new Error('ka-boom');
        error.xyz = 123;
        var err = Boom.wrap(error);
        expect(err.xyz).to.equal(123);
        expect(err.message).to.equal('ka-boom');
        expect(err.output).to.deep.equal({
            statusCode: 500,
            payload: {
                statusCode: 500,
                error: 'Internal Server Error',
                message: 'ka-boom'
            },
            headers: {}
        });
        done();
    });

    describe('#create', function () {

        it('does not sets null message', function (done) {

            var error = Boom.unauthorized(null);
            expect(error.output.payload.message).to.not.exist;
            done();
        });
    });

    describe('#isBoom', function () {

        it('returns true for Boom object', function (done) {

            expect(Boom.badRequest().isBoom).to.equal(true);
            done();
        });

        it('returns false for Error object', function (done) {

            expect((new Error()).isBoom).to.not.exist;
            done();
        });
    });

    describe('#badRequest', function () {

        it('returns a 400 error statusCode', function (done) {

            expect(Boom.badRequest().output.statusCode).to.equal(400);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.badRequest('my message').message).to.equal('my message');
            done();
        });
    });

    describe('#unauthorized', function () {

        it('returns a 401 error statusCode', function (done) {

            var err = Boom.unauthorized();
            expect(err.output.statusCode).to.equal(401);
            expect(err.output.headers).to.deep.equal({});
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.unauthorized('my message').message).to.equal('my message');
            done();
        });

        it('returns a WWW-Authenticate header when passed a scheme', function (done) {

            var err = Boom.unauthorized('boom', 'Test');
            expect(err.output.statusCode).to.equal(401);
            expect(err.output.headers['WWW-Authenticate']).to.equal('Test error="boom"');
            done();
        });

        it('returns a WWW-Authenticate header when passed a scheme and attributes', function (done) {

            var err = Boom.unauthorized('boom', 'Test', { a: 1, b: 'something', c: null, d: 0 });
            expect(err.output.statusCode).to.equal(401);
            expect(err.output.headers['WWW-Authenticate']).to.equal('Test a="1", b="something", c="", d="0", error="boom"');
            done();
        });

        it('sets the isMissing flag when error message is empty', function (done) {

            var err = Boom.unauthorized('', 'Basic');
            expect(err.isMissing).to.equal(true);
            done();
        });

        it('does not set the isMissing flag when error message is not empty', function (done) {

            var err = Boom.unauthorized('message', 'Basic');
            expect(err.isMissing).to.equal(undefined);
            done();
        });

        it('sets a WWW-Authenticate when passed as an array', function (done) {

            var err = Boom.unauthorized('message', ['Basic', 'Example e="1"', 'Another x="3", y="4"']);
            expect(err.output.headers['WWW-Authenticate']).to.equal('Basic, Example e="1", Another x="3", y="4"');
            done();
        });
    });


    describe('#methodNotAllowed', function () {

        it('returns a 405 error statusCode', function (done) {

            expect(Boom.methodNotAllowed().output.statusCode).to.equal(405);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.methodNotAllowed('my message').message).to.equal('my message');
            done();
        });
    });


    describe('#notAcceptable', function () {

        it('returns a 406 error statusCode', function (done) {

            expect(Boom.notAcceptable().output.statusCode).to.equal(406);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.notAcceptable('my message').message).to.equal('my message');
            done();
        });
    });


    describe('#proxyAuthRequired', function () {

        it('returns a 407 error statusCode', function (done) {

            expect(Boom.proxyAuthRequired().output.statusCode).to.equal(407);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.proxyAuthRequired('my message').message).to.equal('my message');
            done();
        });
    });


    describe('#clientTimeout', function () {

        it('returns a 408 error statusCode', function (done) {

            expect(Boom.clientTimeout().output.statusCode).to.equal(408);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.clientTimeout('my message').message).to.equal('my message');
            done();
        });
    });


    describe('#conflict', function () {

        it('returns a 409 error statusCode', function (done) {

            expect(Boom.conflict().output.statusCode).to.equal(409);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.conflict('my message').message).to.equal('my message');
            done();
        });
    });


    describe('#resourceGone', function () {

        it('returns a 410 error statusCode', function (done) {

            expect(Boom.resourceGone().output.statusCode).to.equal(410);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.resourceGone('my message').message).to.equal('my message');
            done();
        });
    });


    describe('#lengthRequired', function () {

        it('returns a 411 error statusCode', function (done) {

            expect(Boom.lengthRequired().output.statusCode).to.equal(411);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.lengthRequired('my message').message).to.equal('my message');
            done();
        });
    });


    describe('#preconditionFailed', function () {

        it('returns a 412 error statusCode', function (done) {

            expect(Boom.preconditionFailed().output.statusCode).to.equal(412);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.preconditionFailed('my message').message).to.equal('my message');
            done();
        });
    });


    describe('#entityTooLarge', function () {

        it('returns a 413 error statusCode', function (done) {

            expect(Boom.entityTooLarge().output.statusCode).to.equal(413);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.entityTooLarge('my message').message).to.equal('my message');
            done();
        });
    });


    describe('#uriTooLong', function () {

        it('returns a 414 error statusCode', function (done) {

            expect(Boom.uriTooLong().output.statusCode).to.equal(414);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.uriTooLong('my message').message).to.equal('my message');
            done();
        });
    });


    describe('#unsupportedMediaType', function () {

        it('returns a 415 error statusCode', function (done) {

            expect(Boom.unsupportedMediaType().output.statusCode).to.equal(415);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.unsupportedMediaType('my message').message).to.equal('my message');
            done();
        });
    });


    describe('#rangeNotSatisfiable', function () {

        it('returns a 416 error statusCode', function (done) {

            expect(Boom.rangeNotSatisfiable().output.statusCode).to.equal(416);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.rangeNotSatisfiable('my message').message).to.equal('my message');
            done();
        });
    });


    describe('#expectationFailed', function () {

        it('returns a 417 error statusCode', function (done) {

            expect(Boom.expectationFailed().output.statusCode).to.equal(417);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.expectationFailed('my message').message).to.equal('my message');
            done();
        });
    });


    describe('#serverTimeout', function () {

        it('returns a 503 error statusCode', function (done) {

            expect(Boom.serverTimeout().output.statusCode).to.equal(503);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.serverTimeout('my message').message).to.equal('my message');
            done();
        });
    });

    describe('#forbidden', function () {

        it('returns a 403 error statusCode', function (done) {

            expect(Boom.forbidden().output.statusCode).to.equal(403);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.forbidden('my message').message).to.equal('my message');
            done();
        });
    });

    describe('#notFound', function () {

        it('returns a 404 error statusCode', function (done) {

            expect(Boom.notFound().output.statusCode).to.equal(404);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.notFound('my message').message).to.equal('my message');
            done();
        });
    });

    describe('#internal', function () {

        it('returns a 500 error statusCode', function (done) {

            expect(Boom.internal().output.statusCode).to.equal(500);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            var err = Boom.internal('my message');
            expect(err.message).to.equal('my message');
            expect(err.output.payload.message).to.equal('An internal server error occurred');
            done();
        });

        it('passes data on the callback if its passed in', function (done) {

            expect(Boom.internal('my message', { my: 'data' }).data.my).to.equal('data');
            done();
        });

        it('returns an error with composite message', function (done) {

            try {
                JSON.parse('{');
            }
            catch (err) {
                var boom = Boom.internal('Someting bad', err);
                expect(boom.message).to.equal('Someting bad: Unexpected end of input');
                done();
            }
        });
    });

    describe('#notImplemented', function () {

        it('returns a 501 error statusCode', function (done) {

            expect(Boom.notImplemented().output.statusCode).to.equal(501);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.notImplemented('my message').message).to.equal('my message');
            done();
        });
    });


    describe('#badGateway', function () {

        it('returns a 502 error statusCode', function (done) {

            expect(Boom.badGateway().output.statusCode).to.equal(502);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.badGateway('my message').message).to.equal('my message');
            done();
        });
    });

    describe('#gatewayTimeout', function () {

        it('returns a 504 error statusCode', function (done) {

            expect(Boom.gatewayTimeout().output.statusCode).to.equal(504);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.gatewayTimeout('my message').message).to.equal('my message');
            done();
        });
    });

    describe('#badImplementation', function () {

        it('returns a 500 error statusCode', function (done) {

            var err = Boom.badImplementation();
            expect(err.output.statusCode).to.equal(500);
            expect(err.isDeveloperError).to.equal(true);
            done();
        });
    });

    describe('#reformat', function () {

        it('enstatusCodes any HTML markup in the response payload', function (done) {

            var boom = Boom.wrap(new Error('<script>alert(1)</script>'));
            expect(boom.output.payload.message).to.not.contain('<script>');
            done();
        });
    });
});



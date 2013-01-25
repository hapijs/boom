// Load modules

var Chai = require('chai');
var Boom = process.env.TEST_COV ? require('../lib-cov') : require('../lib');


// Declare internals

var internals = {};


// Test shortcuts

var expect = Chai.expect;


describe('Boom', function () {

    it('returns an error with info when constructed using another error and message', function (done) {

        var error = new Error('inner');
        error.xyz = 123;
        var err = new Boom(error, 'outter');
        expect(err.message).to.equal('inner');
        expect(err.info).to.equal('outter');
        expect(err.xyz).to.equal(123);
        expect(err.toResponse()).to.deep.equal({
            code: 500,
            payload: {
                error: 'Internal Server Error',
                code: 500,
                message: 'inner',
                xyz: 123,
                name: 'Error',
                info: 'outter'
            }
        });
        done();
    });

    describe('#badRequest', function () {

        it('returns a 400 error code', function (done) {

            expect(Boom.badRequest().code).to.equal(400);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.badRequest('my message').message).to.equal('my message');
            done();
        });
    });

    describe('#unauthorized', function () {

        it('returns a 401 error code', function (done) {

            var err = Boom.unauthorized();
            expect(err.code).to.equal(401);
            expect(err.toResponse().headers).to.not.exist;
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.unauthorized('my message').message).to.equal('my message');
            done();
        });

        it('returns a WWW-Authenticate header when passed a scheme', function (done) {

            var err = Boom.unauthorized('boom', 'Test');
            expect(err.code).to.equal(401);
            expect(err.toResponse().headers['WWW-Authenticate']).to.equal('Test error="boom"');
            done();
        });

        it('returns a WWW-Authenticate header when passed a scheme and attributes', function (done) {

            var err = Boom.unauthorized('boom', 'Test', { a: 1, b: 'something', c: null, d: 0 });
            expect(err.code).to.equal(401);
            expect(err.toResponse().headers['WWW-Authenticate']).to.equal('Test a="1", b="something", c="", d="0", error="boom"');
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
            expect(err.toResponse().headers['WWW-Authenticate']).to.equal('Basic, Example e="1", Another x="3", y="4"');
            done();
        });
    });

    describe('#clientTimeout', function () {

        it('returns a 408 error code', function (done) {

            expect(Boom.clientTimeout().code).to.equal(408);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.clientTimeout('my message').message).to.equal('my message');
            done();
        });
    });

    describe('#serverTimeout', function () {

        it('returns a 503 error code', function (done) {

            expect(Boom.serverTimeout().code).to.equal(503);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.serverTimeout('my message').message).to.equal('my message');
            done();
        });
    });

    describe('#forbidden', function () {

        it('returns a 403 error code', function (done) {

            expect(Boom.forbidden().code).to.equal(403);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.forbidden('my message').message).to.equal('my message');
            done();
        });
    });

    describe('#notFound', function () {

        it('returns a 404 error code', function (done) {

            expect(Boom.notFound().code).to.equal(404);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            expect(Boom.notFound('my message').message).to.equal('my message');
            done();
        });
    });

    describe('#internal', function () {

        it('returns a 500 error code', function (done) {

            expect(Boom.internal().code).to.equal(500);
            done();
        });

        it('sets the message with the passed in message', function (done) {

            var err = Boom.internal('my message');
            expect(err.message).to.equal('my message');
            expect(err.toResponse().payload.message).to.equal('An internal server error occurred');
            done();
        });

        it('passes data on the callback if its passed in', function (done) {

            expect(Boom.internal('my message', { my: 'data' }).data.my).to.equal('data');
            done();
        });
    });

    describe('#passThrough', function () {

        it('returns a pass-through error', function (done) {

            var err = Boom.passThrough(499, { a: 1 }, 'application/text', { 'X-Test': 'Boom' });
            expect(err.code).to.equal(500);
            expect(err.message).to.equal('Pass-through');
            expect(err.toResponse()).to.deep.equal({
                code: 499,
                payload: { a: 1 },
                type: 'application/text',
                headers: { 'X-Test': 'Boom' }
            });
            done();
        });
    });
});



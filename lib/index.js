'use strict';
// Load modules

const Http = require('http');
const Hoek = require('hoek');


// Declare internals

let internals = {};

exports.wrap = (error, statusCode, message) => {

    Hoek.assert(error instanceof Error, 'Cannot wrap non-Error object');
    return (error.isBoom ? error : internals.initialize(error, statusCode || 500, message));
};


exports.create = (statusCode, message, data) => {

    return internals.create(statusCode, message, data, exports.create);
};

internals.create = (statusCode, message, data, ctor) => {

    let error = new Error(message ? message : undefined);       // Avoids settings null message
    Error.captureStackTrace(error, ctor);                       // Filter the stack to our external API
    error.data = data || null;
    internals.initialize(error, statusCode);
    return error;
};

internals.initialize = (error, statusCode, message) => {

    let numberCode = parseInt(statusCode, 10);
    Hoek.assert(!isNaN(numberCode) && numberCode >= 400, 'First argument must be a number (400+):', statusCode);

    error.isBoom = true;
    error.isServer = numberCode >= 500;

    if (!error.hasOwnProperty('data')) {
        error.data = null;
    }

    error.output = {
        statusCode: numberCode,
        payload: {},
        headers: {}
    };

    error.reformat = internals.reformat;
    error.reformat();

    if (!message &&
        !error.message) {

        message = error.output.payload.error;
    }

    if (message) {
        error.message = (message + (error.message ? ': ' + error.message : ''));
    }

    return error;
};


internals.reformat = function () {

    this.output.payload.statusCode = this.output.statusCode;
    this.output.payload.error = Http.STATUS_CODES[this.output.statusCode] || 'Unknown';

    if (this.output.statusCode === 500) {
        this.output.payload.message = 'An internal server error occurred';              // Hide actual error from user
    }
    else if (this.message) {
        this.output.payload.message = this.message;
    }
};


// 4xx Client Errors

exports.badRequest = (message, data) => {

    return internals.create(400, message, data, exports.badRequest);
};


exports.unauthorized = (message, scheme, attributes) => {          // Or function (message, wwwAuthenticate[])

    let err = internals.create(401, message, undefined, exports.unauthorized);

    if (!scheme) {
        return err;
    }

    let wwwAuthenticate = '';

    if (typeof scheme === 'string') {

        // function (message, scheme, attributes)

        wwwAuthenticate = scheme;

        if (attributes || message) {
            err.output.payload.attributes = {};
        }

        if (attributes) {
            var names = Object.keys(attributes);
            for (let i = 0, il = names.length; i < il; ++i) {
                let name = names[i];
                if (i) {
                    wwwAuthenticate += ',';
                }

                let value = attributes[name];
                if (value === null ||
                    value === undefined) {              // Value can be zero

                    value = '';
                }
                wwwAuthenticate += ' ' + name + '="' + Hoek.escapeHeaderAttribute(value.toString()) + '"';
                err.output.payload.attributes[name] = value;
            }
        }

        if (message) {
            if (attributes) {
                wwwAuthenticate += ',';
            }
            wwwAuthenticate += ' error="' + Hoek.escapeHeaderAttribute(message) + '"';
            err.output.payload.attributes.error = message;
        }
        else {
            err.isMissing = true;
        }
    }
    else {

        // function (message, wwwAuthenticate[])

        let wwwArray = scheme;
        for (let i = 0, il = wwwArray.length; i < il; ++i) {
            if (i) {
                wwwAuthenticate += ', ';
            }

            wwwAuthenticate += wwwArray[i];
        }
    }

    err.output.headers['WWW-Authenticate'] = wwwAuthenticate;

    return err;
};


exports.forbidden = (message, data) => {

    return internals.create(403, message, data, exports.forbidden);
};


exports.notFound = (message, data) => {

    return internals.create(404, message, data, exports.notFound);
};


exports.methodNotAllowed = (message, data) => {

    return internals.create(405, message, data, exports.methodNotAllowed);
};


exports.notAcceptable = (message, data) => {

    return internals.create(406, message, data, exports.notAcceptable);
};


exports.proxyAuthRequired = (message, data) => {

    return internals.create(407, message, data, exports.proxyAuthRequired);
};


exports.clientTimeout = (message, data) => {

    return internals.create(408, message, data, exports.clientTimeout);
};


exports.conflict = (message, data) => {

    return internals.create(409, message, data, exports.conflict);
};


exports.resourceGone = (message, data) => {

    return internals.create(410, message, data, exports.resourceGone);
};


exports.lengthRequired = (message, data) => {

    return internals.create(411, message, data, exports.lengthRequired);
};


exports.preconditionFailed = (message, data) => {

    return internals.create(412, message, data, exports.preconditionFailed);
};


exports.entityTooLarge = (message, data) => {

    return internals.create(413, message, data, exports.entityTooLarge);
};


exports.uriTooLong = (message, data) => {

    return internals.create(414, message, data, exports.uriTooLong);
};


exports.unsupportedMediaType = (message, data) => {

    return internals.create(415, message, data, exports.unsupportedMediaType);
};


exports.rangeNotSatisfiable = (message, data) => {

    return internals.create(416, message, data, exports.rangeNotSatisfiable);
};


exports.expectationFailed = (message, data) => {

    return internals.create(417, message, data, exports.expectationFailed);
};

exports.badData = (message, data) => {

    return internals.create(422, message, data, exports.badData);
};


exports.preconditionRequired = (message, data) => {

    return internals.create(428, message, data, exports.preconditionRequired);
};


exports.tooManyRequests = (message, data) => {

    return internals.create(429, message, data, exports.tooManyRequests);
};


// 5xx Server Errors

exports.internal = function (message, data, statusCode) {

    return internals.serverError(message, data, statusCode, exports.internal);
};

internals.serverError = (message, data, statusCode, ctor) => {

    let error;
    if (data instanceof Error) {
        error = exports.wrap(data, statusCode, message);
    } else {
        error = internals.create(statusCode || 500, message, ctor);
        error.data = data;
    }

    return error;
};


exports.notImplemented = (message, data) => {

    return internals.serverError(message, data, 501, exports.notImplemented);
};


exports.badGateway = (message, data) => {

    return internals.serverError(message, data, 502, exports.badGateway);
};


exports.serverTimeout = (message, data) => {

    return internals.serverError(message, data, 503, exports.serverTimeout);
};


exports.gatewayTimeout = (message, data) => {

    return internals.serverError(message, data, 504, exports.gatewayTimeout);
};


exports.badImplementation = (message, data) => {

    var err = internals.serverError(message, data, 500, exports.badImplementation);
    err.isDeveloperError = true;
    return err;
};

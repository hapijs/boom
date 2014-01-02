// Load modules

var Http = require('http');
var Hoek = require('hoek');


// Declare internals

var internals = {};


exports.wrap = function (error, statusCode, message) {

    Hoek.assert(error instanceof Error, 'Cannot wrap non-Error object');
    return (error.isBoom ? error : internals.initialize(error, statusCode || 500, message));
};


internals.create = function (statusCode, message) {

    var error = new Error(message ? message : undefined);       // Avoids settings null message
    internals.initialize(error, statusCode);
    return error;
};


internals.initialize = function (error, statusCode, message) {

    Hoek.assert(!isNaN(parseFloat(statusCode)) && isFinite(statusCode) && statusCode >= 400, 'First argument must be a number (400+):', statusCode);

    error.isBoom = true;
    error.data = null;
    error.output = {
        statusCode: statusCode,
        payload: {},
        headers: {}
    };

    error.reformat = internals.reformat;
    error.reformat();

    if (message) {
        error.message = (message + (error.message ? ': ' + error.message : ''));
    }

    return error;
};


internals.reformat = function () {

    this.output.payload.statusCode = this.output.statusCode;
    this.output.payload.error = Http.STATUS_CODES[this.output.statusCode] || 'Unknown';
    if (this.message) {
        this.output.payload.message = Hoek.escapeHtml(this.message);         // Prevent XSS from error message
    }
};


// 4xx Client Errors

exports.badRequest = function (message) {

    return internals.create(400, message);
};


exports.unauthorized = function (message, scheme, attributes) {          // Or function (message, wwwAuthenticate[])

    var err = internals.create(401, message);

    if (!scheme) {
        return err;
    }

    var wwwAuthenticate = '';
    var i = 0;
    var il = 0;

    if (typeof scheme === 'string') {

        // function (message, scheme, attributes)

        wwwAuthenticate = scheme;
        if (attributes) {
            var names = Object.keys(attributes);
            for (i = 0, il = names.length; i < il; ++i) {
                if (i) {
                    wwwAuthenticate += ',';
                }

                var value = attributes[names[i]];
                if (value === null ||
                    value === undefined) {              // Value can be zero

                    value = '';
                }
                wwwAuthenticate += ' ' + names[i] + '="' + Hoek.escapeHeaderAttribute(value.toString()) + '"';
            }
        }

        if (message) {
            if (attributes) {
                wwwAuthenticate += ',';
            }
            wwwAuthenticate += ' error="' + Hoek.escapeHeaderAttribute(message) + '"';
        }
        else {
            err.isMissing = true;
        }
    }
    else {

        // function (message, wwwAuthenticate[])

        var wwwArray = scheme;
        for (i = 0, il = wwwArray.length; i < il; ++i) {
            if (i) {
                wwwAuthenticate += ', ';
            }

            wwwAuthenticate += wwwArray[i];
        }
    }

    err.output.headers['WWW-Authenticate'] = wwwAuthenticate;

    return err;
};


exports.forbidden = function (message) {

    return internals.create(403, message);
};


exports.notFound = function (message) {

    return internals.create(404, message);
};


exports.methodNotAllowed = function (message) {

    return internals.create(405, message);
};


exports.notAcceptable = function (message) {

    return internals.create(406, message);
};


exports.proxyAuthRequired = function (message) {

    return internals.create(407, message);
};


exports.clientTimeout = function (message) {

    return internals.create(408, message);
};


exports.conflict = function (message) {

    return internals.create(409, message);
};


exports.resourceGone = function (message) {

    return internals.create(410, message);
};


exports.lengthRequired = function (message) {

    return internals.create(411, message);
};


exports.preconditionFailed = function (message) {

    return internals.create(412, message);
};


exports.entityTooLarge = function (message) {

    return internals.create(413, message);
};


exports.uriTooLong = function (message) {

    return internals.create(414, message);
};


exports.unsupportedMediaType = function (message) {

    return internals.create(415, message);
};


exports.rangeNotSatisfiable = function (message) {

    return internals.create(416, message);
};


exports.expectationFailed = function (message) {

    return internals.create(417, message);
};


// 5xx Server Errors

exports.internal = function (message, data, statusCode) {

    var error = (data instanceof Error ? exports.wrap(data, statusCode, message) : internals.create(statusCode || 500, message));

    if (data instanceof Error === false) {
        error.data = data;
    }

    error.output.payload.message = 'An internal server error occurred';           // Hide actual error from user
    return error;
};


exports.notImplemented = function (message, data) {

    return exports.internal(message, data, 501);
};


exports.badGateway = function (message, data) {

    return exports.internal(message, data, 502);
};


exports.serverTimeout = function (message, data) {

    return exports.internal(message, data, 503);
};


exports.gatewayTimeout = function (message, data) {

    return exports.internal(message, data, 504);
};


exports.badImplementation = function (message, data) {

    var err = exports.internal(message, data, 500);
    err.isDeveloperError = true;
    return err;
};


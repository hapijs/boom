// Load modules

var Http = require('http');
var NodeUtil = require('util');
var Hoek = require('hoek');


// Declare internals

var internals = {};


exports = module.exports = internals.Boom = function (/* (new Error) or (code, message) */) {

    Hoek.assert(this instanceof internals.Boom, 'Error must be instantiated using new');

    Error.call(this);
    this.isBoom = true;

    this.response = {
        code: 0,
        payload: {},
        headers: {}
        // type: 'content-type'
    };

    if (arguments[0] instanceof Error) {

        // Error

        var error = arguments[0];

        this.data = error;
        this.stack = error.stack;
        this.response.code = error.code || 500;
        if (error.message) {
            this.message = error.message;
        }
    }
    else {
        // code, message

        var code = arguments[0];
        var message = arguments[1];

        Hoek.assert(!isNaN(parseFloat(code)) && isFinite(code) && code >= 400, 'First argument must be a number (400+)');

        this.response.code = code;
        if (message) {
            this.message = message;
        }
    }

    // Response format

    this.reformat();

    return this;
};

NodeUtil.inherits(internals.Boom, Error);


internals.Boom.prototype.reformat = function () {

    this.response.payload.code = this.response.code;
    this.response.payload.error = Http.STATUS_CODES[this.response.code] || 'Unknown';
    if (this.message) {
        this.response.payload.message = Hoek.escapeHtml(this.message);         // Prevent XSS from error message
    }
};


// Return custom keys added to the error root or response.payload

internals.Boom.prototype.decorations = function () {

    var decoration = {};

    var rootKeys = Object.keys(this);
    for (var i = 0, il = rootKeys.length; i < il; ++i) {
        var key = rootKeys[i];
        if (typeof this[key] !== 'function' &&
            key[0] !== '_' &&
            ['isBoom', 'response', 'message'].indexOf(key) === -1) {

            decoration[key] = this[key];
        }
    }

    var responseKeys = Object.keys(this.response.payload);
    for (i = 0, il = responseKeys.length; i < il; ++i) {
        var key = responseKeys[i];
        if (['code', 'error', 'message'].indexOf(key) === -1) {

            decoration.response = decoration.response || {};
            decoration.response[key] = this.response.payload[key];
        }
    }

    return decoration;
};


// 4xx Client Errors

internals.Boom.badRequest = function (message) {

    return new internals.Boom(400, message);
};


internals.Boom.unauthorized = function (message, scheme, attributes) {          // Or function (message, wwwAuthenticate[])

    var err = new internals.Boom(401, message);

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

    err.response.headers['WWW-Authenticate'] = wwwAuthenticate;

    return err;
};


internals.Boom.forbidden = function (message) {

    return new internals.Boom(403, message);
};


internals.Boom.notFound = function (message) {

    return new internals.Boom(404, message);
};


internals.Boom.methodNotAllowed = function (message) {

    return new internals.Boom(405, message);
};


internals.Boom.notAcceptable = function (message) {

    return new internals.Boom(406, message);
};


internals.Boom.proxyAuthRequired = function (message) {

    return new internals.Boom(407, message);
};


internals.Boom.clientTimeout = function (message) {

    return new internals.Boom(408, message);
};


internals.Boom.conflict = function (message) {

    return new internals.Boom(409, message);
};


internals.Boom.resourceGone = function (message) {

    return new internals.Boom(410, message);
};


internals.Boom.lengthRequired = function (message) {

    return new internals.Boom(411, message);
};


internals.Boom.preconditionFailed = function (message) {

    return new internals.Boom(412, message);
};


internals.Boom.entityTooLarge = function (message) {

    return new internals.Boom(413, message);
};


internals.Boom.uriTooLong = function (message) {

    return new internals.Boom(414, message);
};


internals.Boom.unsupportedMediaType = function (message) {

    return new internals.Boom(415, message);
};


internals.Boom.rangeNotSatisfiable = function (message) {

    return new internals.Boom(416, message);
};


internals.Boom.expectationFailed = function (message) {

    return new internals.Boom(417, message);
};


// 5xx Server Errors

internals.Boom.internal = function (message, data, code) {

    var err = new internals.Boom(code || 500, message);

    if (data && data.stack) {
        err.trace = data.stack.split('\n');
        err.outterTrace = Hoek.displayStack(1);
    }
    else {
        err.trace = Hoek.displayStack(1);
    }

    err.data = data;
    err.response.payload.message = 'An internal server error occurred';                     // Hide actual error from user

    return err;
};


internals.Boom.notImplemented = function (message, data) {

    return internals.Boom.internal(message, data, 501);
};


internals.Boom.badGateway = function (message, data) {

    return internals.Boom.internal(message, data, 502);
};


internals.Boom.serverTimeout = function (message, data) {

    return internals.Boom.internal(message, data, 503);
};


internals.Boom.gatewayTimeout = function (message, data) {

    return internals.Boom.internal(message, data, 504);
};


internals.Boom.badImplementation = function (message, data) {

    var err = internals.Boom.internal(message, data, 500);
    err.isDeveloperError = true;
    return err;
};


internals.Boom.passThrough = function (code, payload, contentType, headers) {

    var err = new internals.Boom(500, 'Pass-through');                                      // 500 code is only used to initialize

    err.data = {
        code: code,
        payload: payload,
        type: contentType
    };

    err.response.code = code;
    err.response.type = contentType;
    err.response.headers = headers;
    err.response.payload = payload;

    return err;
};



// Load modules

var Hoek = require('hoek');


// Declare internals

var internals = {};


exports.wrap = function (error, statusCode, message) {

    Hoek.assert(error instanceof Error, 'Cannot wrap non-Error object');
    return (error.isBoom ? error : internals.initialize(error, statusCode || 500, message));
};


exports.create = function (statusCode, message, data) {

    var error = new Error(message ? message : undefined);       // Avoids settings null message
    error.data = data || null;
    internals.initialize(error, statusCode);
    return error;
};

internals.STATUS_CODES = {
  '100': 'Continue',
  '101': 'Switching Protocols',
  '102': 'Processing',
  '200': 'OK',
  '201': 'Created',
  '202': 'Accepted',
  '203': 'Non-Authoritative Information',
  '204': 'No Content',
  '205': 'Reset Content',
  '206': 'Partial Content',
  '207': 'Multi-Status',
  '300': 'Multiple Choices',
  '301': 'Moved Permanently',
  '302': 'Moved Temporarily',
  '303': 'See Other',
  '304': 'Not Modified',
  '305': 'Use Proxy',
  '307': 'Temporary Redirect',
  '308': 'Permanent Redirect',
  '400': 'Bad Request',
  '401': 'Unauthorized',
  '402': 'Payment Required',
  '403': 'Forbidden',
  '404': 'Not Found',
  '405': 'Method Not Allowed',
  '406': 'Not Acceptable',
  '407': 'Proxy Authentication Required',
  '408': 'Request Time-out',
  '409': 'Conflict',
  '410': 'Gone',
  '411': 'Length Required',
  '412': 'Precondition Failed',
  '413': 'Request Entity Too Large',
  '414': 'Request-URI Too Large',
  '415': 'Unsupported Media Type',
  '416': 'Requested Range Not Satisfiable',
  '417': 'Expectation Failed',
  '418': 'I\'m a teapot',
  '422': 'Unprocessable Entity',
  '423': 'Locked',
  '424': 'Failed Dependency',
  '425': 'Unordered Collection',
  '426': 'Upgrade Required',
  '428': 'Precondition Required',
  '429': 'Too Many Requests',
  '431': 'Request Header Fields Too Large',
  '500': 'Internal Server Error',
  '501': 'Not Implemented',
  '502': 'Bad Gateway',
  '503': 'Service Unavailable',
  '504': 'Gateway Time-out',
  '505': 'HTTP Version Not Supported',
  '506': 'Variant Also Negotiates',
  '507': 'Insufficient Storage',
  '509': 'Bandwidth Limit Exceeded',
  '510': 'Not Extended',
  '511': 'Network Authentication Required'
};

internals.initialize = function (error, statusCode, message) {

    var numberCode = parseInt(statusCode, 10);
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
    this.output.payload.error = internals.STATUS_CODES[this.output.statusCode] || 'Unknown';

    if (this.output.statusCode === 500) {
        this.output.payload.message = 'An internal server error occurred';              // Hide actual error from user
    }
    else if (this.message) {
        this.output.payload.message = this.message;
    }
};


// 4xx Client Errors

exports.badRequest = function (message, data) {

    return exports.create(400, message, data);
};


exports.unauthorized = function (message, scheme, attributes) {          // Or function (message, wwwAuthenticate[])

    var err = exports.create(401, message);

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


exports.forbidden = function (message, data) {

    return exports.create(403, message, data);
};


exports.notFound = function (message, data) {

    return exports.create(404, message, data);
};


exports.methodNotAllowed = function (message, data) {

    return exports.create(405, message, data);
};


exports.notAcceptable = function (message, data) {

    return exports.create(406, message, data);
};


exports.proxyAuthRequired = function (message, data) {

    return exports.create(407, message, data);
};


exports.clientTimeout = function (message, data) {

    return exports.create(408, message, data);
};


exports.conflict = function (message, data) {

    return exports.create(409, message, data);
};


exports.resourceGone = function (message, data) {

    return exports.create(410, message, data);
};


exports.lengthRequired = function (message, data) {

    return exports.create(411, message, data);
};


exports.preconditionFailed = function (message, data) {

    return exports.create(412, message, data);
};


exports.entityTooLarge = function (message, data) {

    return exports.create(413, message, data);
};


exports.uriTooLong = function (message, data) {

    return exports.create(414, message, data);
};


exports.unsupportedMediaType = function (message, data) {

    return exports.create(415, message, data);
};


exports.rangeNotSatisfiable = function (message, data) {

    return exports.create(416, message, data);
};


exports.expectationFailed = function (message, data) {

    return exports.create(417, message, data);
};

exports.badData = function (message, data) {

    return exports.create(422, message, data);
};


exports.tooManyRequests = function (message, data) {

    return exports.create(429, message, data);
};


// 5xx Server Errors

exports.internal = function (message, data, statusCode) {

    var error = (data instanceof Error ? exports.wrap(data, statusCode, message) : exports.create(statusCode || 500, message));

    if (data instanceof Error === false) {
        error.data = data;
    }

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

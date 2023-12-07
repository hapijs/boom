'use strict';

const Hoek = require('@hapi/hoek');


const internals = {
    codes: new Map([
        [100, 'Continue'],
        [101, 'Switching Protocols'],
        [102, 'Processing'],
        [200, 'OK'],
        [201, 'Created'],
        [202, 'Accepted'],
        [203, 'Non-Authoritative Information'],
        [204, 'No Content'],
        [205, 'Reset Content'],
        [206, 'Partial Content'],
        [207, 'Multi-Status'],
        [300, 'Multiple Choices'],
        [301, 'Moved Permanently'],
        [302, 'Moved Temporarily'],
        [303, 'See Other'],
        [304, 'Not Modified'],
        [305, 'Use Proxy'],
        [307, 'Temporary Redirect'],
        [400, 'Bad Request'],
        [401, 'Unauthorized'],
        [402, 'Payment Required'],
        [403, 'Forbidden'],
        [404, 'Not Found'],
        [405, 'Method Not Allowed'],
        [406, 'Not Acceptable'],
        [407, 'Proxy Authentication Required'],
        [408, 'Request Time-out'],
        [409, 'Conflict'],
        [410, 'Gone'],
        [411, 'Length Required'],
        [412, 'Precondition Failed'],
        [413, 'Request Entity Too Large'],
        [414, 'Request-URI Too Large'],
        [415, 'Unsupported Media Type'],
        [416, 'Requested Range Not Satisfiable'],
        [417, 'Expectation Failed'],
        [418, 'I\'m a teapot'],
        [422, 'Unprocessable Entity'],
        [423, 'Locked'],
        [424, 'Failed Dependency'],
        [425, 'Too Early'],
        [426, 'Upgrade Required'],
        [428, 'Precondition Required'],
        [429, 'Too Many Requests'],
        [431, 'Request Header Fields Too Large'],
        [451, 'Unavailable For Legal Reasons'],
        [500, 'Internal Server Error'],
        [501, 'Not Implemented'],
        [502, 'Bad Gateway'],
        [503, 'Service Unavailable'],
        [504, 'Gateway Time-out'],
        [505, 'HTTP Version Not Supported'],
        [506, 'Variant Also Negotiates'],
        [507, 'Insufficient Storage'],
        [509, 'Bandwidth Limit Exceeded'],
        [510, 'Not Extended'],
        [511, 'Network Authentication Required']
    ])
};


exports.Boom = class Boom extends Error {

    data = null;
    output;

    get isServer() {

        return this.output.statusCode >= 500;
    }

    set isServer(value) {}                                             // Allow for compatiblity with legacy boom

    constructor(message, options = {}) {

        const { statusCode = 500, data, headers, decorate, ctor = exports.Boom, cause } = options;

        super(message ?? internals.codes.get(statusCode) ?? 'Unknown', { cause });
        Error.captureStackTrace(this, ctor);                           // Filter the stack to our external API

        if (cause !== undefined) {
            this.cause ??= cause;                                      // Explicitly assign cause to work with old runtimes
        }

        internals.apply(this, data, decorate, statusCode, headers);
    }

    static [Symbol.hasInstance](instance) {

        if (this === exports.Boom) {
            return exports.isBoom(instance);
        }

        // Cannot use 'instanceof' as it creates infinite recursion

        return this.prototype.isPrototypeOf(instance);
    }

    reformat(debug = false) {

        this.output.payload = new internals.PayloadObject(this, this.output.statusCode, debug);
    }

    static {
        Object.defineProperty(this.prototype, 'name', { value: 'Boom', writable: true, configurable: true });
        Object.defineProperty(this.prototype, 'isBoom', { value: true, writable: true, configurable: true });
    }
};


exports.isBoom = function (err, statusCode) {

    return err instanceof Error && !!err.isBoom && (!statusCode || err.output.statusCode === statusCode);
};


exports.boomify = function (err, options = {}) {

    const { override, data, decorate, statusCode, message } = options;

    if (!err?.isBoom) {
        return new exports.Boom(message, { statusCode, cause: err, data, decorate });
    }

    if (override === false) {                                 // Defaults to true
        internals.apply(err, data, decorate);
    }
    else {
        internals.apply(err, data, decorate, statusCode ?? err.output.statusCode, {}, message);
    }

    err.isServer = err.output.statusCode >= 500;              // Assign, in case it is a legacy boom object

    return err;
};


internals.apply = function (boom, data, decorate, statusCode, headers, message) {

    if (decorate) {
        Object.assign(boom, decorate);
    }

    if (data !== undefined) {
        boom.data = data;
    }

    if (statusCode) {
        const numberCode = parseInt(statusCode, 10);
        if (isNaN(numberCode) || numberCode < 400) {
            throw new TypeError(`statusCode must be a number (400+): ${statusCode}`);
        }

        if (message) {
            boom.message = `${message}: ${boom.message}`;
        }

        const payload = new internals.PayloadObject(boom, numberCode, false);
        boom.output = new internals.BoomOutput(numberCode, payload, headers);
    }
};


internals.PayloadObject = class {

    statusCode;
    error;
    message;

    constructor(error, statusCode, debug) {

        this.statusCode = statusCode;
        this.error = internals.codes.get(statusCode) ?? 'Unknown';

        if (statusCode === 500 && debug !== true) {
            this.message = 'An internal server error occurred';              // Hide actual error from user
        }
        else {
            this.message = error.message;
            if (error.cause) {
                const message = error.cause.message ?? error.cause;
                this.message = (error.message === this.error) ? message : error.message + ': ' + message;
            }
        }
    }
};


internals.BoomOutput = class {

    statusCode;
    payload;
    headers;

    constructor(statusCode, payload, headers) {

        this.statusCode = statusCode;
        this.payload = payload;
        this.headers = headers ? Hoek.clone(headers, { prototype: false, symbols: false }) : {};
    }
};


internals.statusError = function (statusCode, massage) {

    const method = massage ?
        function (...args) {

            const [message, options, decorate] = massage(...args);
            return Object.assign(new exports.Boom(message, { statusCode, ctor: method, ...options }), decorate);
        } :
        function (message, data) {

            return new exports.Boom(message, { statusCode, data, ctor: method });
        };

    return method;
};


// 4xx Client Errors

exports.badRequest = internals.statusError(400);


exports.unauthorized = internals.statusError(401, (message, scheme, attributes) => {     // Or (message, wwwAuthenticate[])

    // function (message)

    if (!scheme) {
        return [message];
    }

    // function (message, wwwAuthenticate[])

    if (typeof scheme !== 'string') {
        const headers = { 'WWW-Authenticate': scheme.join(', ') };
        return [message, { headers }];
    }

    // function (message, scheme, attributes)

    const decorate = {};
    let stringified = '';

    if (attributes) {
        if (typeof attributes === 'string') {
            stringified += Hoek.escapeHeaderAttribute(attributes);
        }
        else {
            stringified += Object.keys(attributes).map((name) => {

                const value = attributes[name] ?? '';

                return `${name}="${Hoek.escapeHeaderAttribute(value.toString())}"`;
            })
                .join(', ');
        }
    }

    if (message) {
        if (stringified) {
            stringified += ', ';
        }

        stringified += `error="${Hoek.escapeHeaderAttribute(message)}"`;
    }
    else {
        decorate.isMissing = true;
    }

    const headers = { 'WWW-Authenticate': stringified ? `${scheme} ${stringified}` : `${scheme}` };
    return [message, { headers }, decorate];
});


exports.paymentRequired = internals.statusError(402);


exports.forbidden = internals.statusError(403);


exports.notFound = internals.statusError(404);


exports.methodNotAllowed = internals.statusError(405, (message, data, allow) => {

    if (typeof allow === 'string') {
        allow = [allow];
    }

    const headers = Array.isArray(allow) ? {
        Allow: allow.join(', ')
    } : null;

    return [message, { data, headers }];
});


exports.notAcceptable = internals.statusError(406);


exports.proxyAuthRequired = internals.statusError(407);


exports.clientTimeout = internals.statusError(408);


exports.conflict = internals.statusError(409);


exports.resourceGone = internals.statusError(410);


exports.lengthRequired = internals.statusError(411);


exports.preconditionFailed = internals.statusError(412);


exports.entityTooLarge = internals.statusError(413);


exports.uriTooLong = internals.statusError(414);


exports.unsupportedMediaType = internals.statusError(415);


exports.rangeNotSatisfiable = internals.statusError(416);


exports.expectationFailed = internals.statusError(417);


exports.teapot = internals.statusError(418);


exports.badData = internals.statusError(422);


exports.locked = internals.statusError(423);


exports.failedDependency = internals.statusError(424);


exports.tooEarly = internals.statusError(425);


exports.preconditionRequired = internals.statusError(428);


exports.tooManyRequests = internals.statusError(429);


exports.illegal = internals.statusError(451);


// 5xx Server Errors

exports.internal = internals.statusError(500, (message, data, statusCode = 500) => {

    const res = internals.serverError(message, data);
    if (statusCode !== 500) {
        res[1].statusCode = statusCode;
    }

    return res;
});


exports.notImplemented = internals.statusError(501, internals.serverError);


exports.badGateway = internals.statusError(502, internals.serverError);


exports.serverUnavailable = internals.statusError(503, internals.serverError);


exports.gatewayTimeout = internals.statusError(504, internals.serverError);


exports.badImplementation = internals.statusError(500, (message, data) => {

    const res = internals.serverError(message, data);
    res.push({ isDeveloperError: true });
    return res;
});


internals.serverError = function (message, data) {

    const isDataNonBoomError = data instanceof Error && !exports.isBoom(data);

    return [message, isDataNonBoomError ? { cause: data } : { data }];
};

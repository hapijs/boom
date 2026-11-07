import { escapeHeaderAttribute } from '@hapi/hoek';

const codes = new Map([
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
    [418, "I'm a teapot"],
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
    [511, 'Network Authentication Required'],
]);

export class Boom extends Error {
    data = null;
    output;

    get isServer() {
        return this.output.statusCode >= 500;
    }

    // Allow for compatiblity with legacy boom

    set isServer(value) {
        Object.defineProperty(this, 'isServer', {
            value,
            writable: true,
            configurable: true,
        });
    }

    constructor(message, options = {}) {
        const { statusCode = 500, data, headers, ctor = Boom } = options;
        const causeOption = 'cause' in options ? { cause: options.cause } : undefined;

        super(message ?? codes.get(statusCode) ?? 'Unknown', causeOption);
        // Only use Error.captureStackTrace when available

        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, ctor); // Filter the stack to our external API
        }

        if (causeOption) {
            this.cause ??= causeOption.cause; // Explicitly assign cause to work with old runtimes
        }

        apply(this, data, statusCode, headers);
    }

    static [Symbol.hasInstance](instance) {
        if (this === Boom) {
            return isBoom(instance);
        }

        // Cannot use 'instanceof' as it creates infinite recursion

        return this.prototype.isPrototypeOf(instance);
    }

    reformat(debug = false) {
        this.output.payload = new PayloadObject(this, this.output.statusCode, debug);
    }

    static {
        Object.defineProperties(this.prototype, {
            name: { value: 'Boom', writable: true, configurable: true },
            isBoom: { value: true, writable: true, configurable: true },
        });
    }
}

export function isBoom(err, statusCode) {
    return err instanceof Error && !!err.isBoom && (!statusCode || err.output?.statusCode === statusCode);
}

export function boomify(err, options = {}) {
    const { override, data, statusCode, message } = options;

    if (!err?.isBoom === true) {
        return new Boom(message, { statusCode, cause: err, data });
    }

    // override defaults to true

    if (override === false) {
        apply(err, data);
    } else {
        apply(err, data, statusCode ?? err.output.statusCode, {}, message);
    }

    if (Object.hasOwn(err, 'isServer')) {
        err.isServer = err.output.statusCode >= 500; // Assign, in case it is a legacy boom object
    }

    return err;
}

function apply(boom, data, statusCode, headers, message) {
    if (data !== undefined) {
        boom.data = data;
    }

    if (statusCode) {
        const numberCode = parseInt(statusCode, 10);
        if (isNaN(numberCode) || numberCode < 400) {
            throw new TypeError(`statusCode must be a number (400+): ${statusCode}`);
        }

        if (headers !== undefined && (headers === null || typeof headers !== 'object')) {
            throw new TypeError('headers must be an object');
        }

        if (message) {
            boom.message = `${message}: ${boom.message}`;
        }

        boom.output = new BoomOutput(numberCode, headers);
        boom.reformat();
    }
}

class PayloadObject {
    statusCode;
    error;
    message;

    constructor(error, statusCode, debug) {
        this.statusCode = statusCode;
        this.error = codes.get(statusCode) ?? 'Unknown';

        if (statusCode === 500 && debug !== true) {
            this.message = 'An internal server error occurred'; // Hide actual error from user
        } else {
            this.message = error.message;
            if (error.cause) {
                const message = error.cause.message ?? error.cause;
                this.message = error.message === this.error ? message : error.message + ': ' + message;
            }
        }
    }
}

class BoomOutput {
    statusCode;
    payload = {};
    headers;

    constructor(statusCode, headers) {
        this.statusCode = statusCode;

        const copy = Object.assign(Object.create(null), headers);
        for (const [key, value] of Object.entries(copy)) {
            if (Array.isArray(value)) {
                copy[key] = value.slice();
            }
        }

        this.headers = copy;
    }
}

function statusError(statusCode, massage) {
    const method = massage
        ? function (...args) {
              const [message, options, decorate] = massage(...args);
              return Object.assign(new Boom(message, { statusCode, ctor: method, ...options }), decorate);
          }
        : function (message, data) {
              return new Boom(message, { statusCode, data, ctor: method });
          };

    return method;
}

// 4xx Client Errors

export const badRequest = statusError(400);

// Or (message, wwwAuthenticate[])

export const unauthorized = statusError(401, (message, scheme, attributes) => {
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
            stringified += escapeHeaderAttribute(attributes);
        } else {
            stringified += Object.keys(attributes)
                .map((name) => {
                    const value = attributes[name] ?? '';

                    return `${name}="${escapeHeaderAttribute(value.toString())}"`;
                })
                .join(', ');
        }
    }

    if (message) {
        if (stringified) {
            stringified += ', ';
        }

        stringified += `error="${escapeHeaderAttribute(message)}"`;
    } else {
        decorate.isMissing = true;
    }

    const headers = { 'WWW-Authenticate': stringified ? `${scheme} ${stringified}` : `${scheme}` };
    return [message, { headers }, decorate];
});

export const paymentRequired = statusError(402);

export const forbidden = statusError(403);

export const notFound = statusError(404);

export const methodNotAllowed = statusError(405, (message, data, allow) => {
    if (typeof allow === 'string') {
        allow = [allow];
    }

    const headers = Array.isArray(allow)
        ? {
              Allow: allow.join(', '),
          }
        : undefined;

    return [message, { data, headers }];
});

export const notAcceptable = statusError(406);

export const proxyAuthRequired = statusError(407);

export const clientTimeout = statusError(408);

export const conflict = statusError(409);

export const resourceGone = statusError(410);

export const lengthRequired = statusError(411);

export const preconditionFailed = statusError(412);

export const entityTooLarge = statusError(413);

export const uriTooLong = statusError(414);

export const unsupportedMediaType = statusError(415);

export const rangeNotSatisfiable = statusError(416);

export const expectationFailed = statusError(417);

export const teapot = statusError(418);

export const badData = statusError(422);

export const locked = statusError(423);

export const failedDependency = statusError(424);

export const tooEarly = statusError(425);

export const preconditionRequired = statusError(428);

export const tooManyRequests = statusError(429);

export const illegal = statusError(451);

// 5xx Server Errors

function serverError(message, data) {
    const isDataNonBoomError = data instanceof Error && !isBoom(data);

    return [message, isDataNonBoomError ? { cause: data } : { data }];
}

export const internal = statusError(500, (message, data, statusCode = 500) => {
    const res = serverError(message, data);
    if (statusCode !== 500) {
        const [, options] = res;
        options.statusCode = statusCode;
    }

    return res;
});

export const notImplemented = statusError(501, serverError);

export const badGateway = statusError(502, serverError);

export const serverUnavailable = statusError(503, serverError);

export const gatewayTimeout = statusError(504, serverError);

export const badImplementation = statusError(500, (message, data) => {
    return [...serverError(message, data), { isDeveloperError: true }];
});

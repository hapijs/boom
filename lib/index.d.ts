/**
 * An Error object used to return an HTTP response error (4xx, 5xx)
 */
export class Boom<Data = any> extends Error {

    /**
     * Creates a new Boom object using the provided message or Error
     */
    constructor(message?: string, options?: Options<Data>);

    /**
     * Underlying cause for the Boom error
     */
    cause?: unknown;

    /**
     * Custom error data with additional information specific to the error type
     */
    data: Data;

    /**
     * isBoom - true, indicates this is a Boom object instance.
     */
    readonly isBoom: boolean;

    /**
     * Convenience boolean indicating status code >= 500
     */
    readonly isServer: boolean;

    /**
     * The error message
     */
    message: string;

    /**
     * The formatted response
     */
    output: Output;

    /**
     * Specifies if an error object is a valid boom object
     *
     * @param debug - A boolean that, when true, does not hide the original 500 error message. Defaults to false.
     */
    reformat(debug?: boolean): void;
}


export interface Options<Data> {
    /**
     * The HTTP status code
     *
     * @default 500
     */
    readonly statusCode?: number;

    /**
     * Additional error information
     */
    readonly data?: Data;

    /**
     * An object containing any HTTP headers where each key is a header name and value is the header content
     */
    readonly headers?: { [header: string]: string | readonly string[] | number };

    /**
     * Constructor reference used to crop the exception call stack output
     */
    readonly ctor?: Function;

    /**
     * An underlying cause for the Boom error
     */
    readonly cause?: Error | unknown;
}


export interface BoomifyOptions<Data> extends Options<Data> {
    /**
     * Error message string
     *
     * @default none
     */
    readonly message?: string;

    /**
     * If false, the err provided is a Boom object, and a statusCode or message are provided, the values are ignored
     *
     * @default true
     */
    readonly override?: boolean;
}


export interface Payload {
    /**
     * The HTTP status code derived from error.output.statusCode
     */
    readonly statusCode: number;

    /**
     * The HTTP status message derived from statusCode
     */
    readonly error: string;

    /**
     * The error message derived from error.message
     */
    readonly message: string;
}


export interface Output {
    /**
     * The HTTP status code
     */
    statusCode: number;

    /**
     * An object containing any HTTP headers where each key is a header name and value is the header content
     */
    headers: { [header: string]: string | string[] | number | undefined };

    /**
     * The formatted object used as the response payload (stringified)
     */
    payload: Payload & { [key: string]: unknown };
}


/**
* Specifies if an object is a valid boom object
*
* @param obj - The object to assess
* @param statusCode - Optional status code
*
* @returns Returns a boolean stating if the error object is a valid boom object and it has the provided statusCode (if present)
*/
export function isBoom(obj: unknown, statusCode?: number): obj is Boom;


/**
* Applies options to an existing boom object, or creates a new boom object with the error as `cause`
*
* @param err - The target object
* @param options - Options object
*
* @returns A boom object
*/
export function boomify<Data>(err: Boom<Data>, options?: BoomifyOptions<Data>): Boom<Data>;
export function boomify<Data>(err: unknown, options?: BoomifyOptions<Data>): Boom<Data>;


// 4xx Errors

/**
* Returns a 400 Bad Request error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 400 bad request error
*/
export function badRequest<Data>(message?: string, data?: Data): Boom<Data>;


/**
* Returns a 401 Unauthorized error
*
* @param message - Optional message
*
* @returns A 401 Unauthorized error
*/
export function unauthorized(message?: string): Boom<null>;


/**
* Returns a 401 Unauthorized error
*
* @param message - Optional message
* @param scheme - the authentication scheme name
* @param attributes - an object of values used to construct the 'WWW-Authenticate' header
*
* @returns A 401 Unauthorized error
*/
export function unauthorized(message: '' | null | undefined, scheme: string, attributes?: string | unauthorized.Attributes): Boom<null> & unauthorized.MissingAuth;
export function unauthorized(message: string, scheme: string, attributes?: string | unauthorized.Attributes): Boom<null>;


export namespace unauthorized {

    interface Attributes {
        [index: string]: number | string | null | undefined;
    }

    interface MissingAuth {

        /**
         * Indicate whether the 401 unauthorized error is due to missing credentials (vs. invalid)
         */
        isMissing: true;
    }
}


/**
* Returns a 401 Unauthorized error
*
* @param message - Optional message
* @param wwwAuthenticate - array of string values used to construct the wwwAuthenticate header
*
* @returns A 401 Unauthorized error
*/
export function unauthorized(message: string | null | undefined, wwwAuthenticate: readonly string[]): Boom<null>;


/**
* Returns a 402 Payment Required error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 402 Payment Required error
*/
export function paymentRequired<Data>(message?: string, data?: Data): Boom<Data>;


/**
* Returns a 403 Forbidden error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 403 Forbidden error
*/
export function forbidden<Data>(message?: string, data?: Data): Boom<Data>;


/**
* Returns a 404 Not Found error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 404 Not Found error
*/
export function notFound<Data>(message?: string, data?: Data): Boom<Data>;


/**
* Returns a 405 Method Not Allowed error
*
* @param message - Optional message
* @param data - Optional additional error data
* @param allow - Optional string or array of strings which is used to set the 'Allow' header
*
* @returns A 405 Method Not Allowed error
*/
export function methodNotAllowed<Data>(message?: string, data?: Data, allow?: string | readonly string[]): Boom<Data>;


/**
* Returns a 406 Not Acceptable error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 406 Not Acceptable error
*/
export function notAcceptable<Data>(message?: string, data?: Data): Boom<Data>;


/**
* Returns a 407 Proxy Authentication error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 407 Proxy Authentication error
*/
export function proxyAuthRequired<Data>(message?: string, data?: Data): Boom<Data>;


/**
* Returns a 408 Request Time-out error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 408 Request Time-out error
*/
export function clientTimeout<Data>(message?: string, data?: Data): Boom<Data>;


/**
* Returns a 409 Conflict error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 409 Conflict error
*/
export function conflict<Data>(message?: string, data?: Data): Boom<Data>;


/**
* Returns a 410 Gone error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 410 gone error
*/
export function resourceGone<Data>(message?: string, data?: Data): Boom<Data>;


/**
* Returns a 411 Length Required error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 411 Length Required error
*/
export function lengthRequired<Data>(message?: string, data?: Data): Boom<Data>;


/**
* Returns a 412 Precondition Failed error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 412 Precondition Failed error
*/
export function preconditionFailed<Data>(message?: string, data?: Data): Boom<Data>;


/**
* Returns a 413 Request Entity Too Large error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 413 Request Entity Too Large error
*/
export function entityTooLarge<Data>(message?: string, data?: Data): Boom<Data>;


/**
* Returns a 414 Request-URI Too Large error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 414 Request-URI Too Large error
*/
export function uriTooLong<Data>(message?: string, data?: Data): Boom<Data>;


/**
* Returns a 415 Unsupported Media Type error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 415 Unsupported Media Type error
*/
export function unsupportedMediaType<Data>(message?: string, data?: Data): Boom<Data>;


/**
* Returns a 416 Request Range Not Satisfiable error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 416 Request Range Not Satisfiable error
*/
export function rangeNotSatisfiable<Data>(message?: string, data?: Data): Boom<Data>;


/**
* Returns a 417 Expectation Failed error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 417 Expectation Failed error
*/
export function expectationFailed<Data>(message?: string, data?: Data): Boom<Data>;


/**
* Returns a 418 I'm a Teapot error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 418 I'm a Teapot error
*/
export function teapot<Data>(message?: string, data?: Data): Boom<Data>;


/**
* Returns a 422 Unprocessable Entity error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 422 Unprocessable Entity error
*/
export function badData<Data>(message?: string, data?: Data): Boom<Data>;


/**
* Returns a 423 Locked error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 423 Locked error
*/
export function locked<Data>(message?: string, data?: Data): Boom<Data>;


/**
* Returns a 424 Failed Dependency error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 424 Failed Dependency error
*/
export function failedDependency<Data>(message?: string, data?: Data): Boom<Data>;

/**
* Returns a 425 Too Early error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 425 Too Early error
*/
export function tooEarly<Data>(message?: string, data?: Data): Boom<Data>;


/**
* Returns a 428 Precondition Required error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 428 Precondition Required error
*/
export function preconditionRequired<Data>(message?: string, data?: Data): Boom<Data>;


/**
* Returns a 429 Too Many Requests error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 429 Too Many Requests error
*/
export function tooManyRequests<Data>(message?: string, data?: Data): Boom<Data>;


/**
* Returns a 451 Unavailable For Legal Reasons error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 451 Unavailable for Legal Reasons error
*/
export function illegal<Data>(message?: string, data?: Data): Boom<Data>;


// 5xx Errors

/**
* Returns a internal error (defaults to 500)
*
* @param message - Optional message
* @param data - Optional additional error data
* @param statusCode - Optional status code override. Defaults to 500.
*
* @returns A 500 Internal Server error
*/
export function internal<Data>(message?: string, data?: Data | Error, statusCode?: number): Boom<Data>;


/**
* Returns a 500 Internal Server Error error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 500 Internal Server error
*/
export function badImplementation<Data>(message?: string, data?: Data | Error): Boom<Data>;


/**
* Returns a 501 Not Implemented error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 501 Not Implemented error
*/
export function notImplemented<Data>(message?: string, data?: Data | Error): Boom<Data>;


/**
* Returns a 502 Bad Gateway error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 502 Bad Gateway error
*/
export function badGateway<Data>(message?: string, data?: Data | Error): Boom<Data>;


/**
* Returns a 503 Service Unavailable error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 503 Service Unavailable error
*/
export function serverUnavailable<Data>(message?: string, data?: Data | Error): Boom<Data>;


/**
* Returns a 504 Gateway Time-out error
*
* @param message - Optional message
* @param data - Optional additional error data
*
* @returns A 504 Gateway Time-out error
*/
export function gatewayTimeout<Data>(message?: string, data?: Data | Error): Boom<Data>;

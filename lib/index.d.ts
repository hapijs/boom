export interface Payload {
    /**
    The HTTP status code derived from error.output.statuscode
    */
    statusCode: number

    /**
    The HTTP status message derived from statusCode
    */
    error: string

    /**
    The error message derived from error.message
    */
    message: string
}


export interface Output {
    /**
    The HTTP status code
    */
    statusCode: number

    /**
    An object containing any HTTP headers where each key is a header name and value is the header content
    */
    headers: object

    /**
    The formatted object used as the response payload (stringified)
    */
    payload: Payload
}


export interface Options<T> {
    /**
    The HTTP status code

    @default 500
    */
    statusCode?: number

    /**
    Additional error information
    */
    data?: T

    /**
    An option with extra properties to set on the error object
    */
    decorate?: object

    /**
    Constructor reference used to crop the exception call stack output
    */
    ctor?: any

    /**
    Error message string

    @default none
    */
    message?: string

    /**
    If false, the err provided is a Boom object, and a statusCode or message are provided, the values are ignored

    @default true
    */
    override?: boolean
}


export class Boom<T = any> extends Error {

    constructor(message?: string | Error, options?: Options<T>)

    /**
    Convenience bool indicating status code >= 500
    */
    isServer: boolean

    /**
    The error message
    */
    message: string

    /**
    The constructor used to create the error
    */
    typeof: any

    /**
    The formated response
    */
    output: Output

    /**
    Specifies if an error object is a valid boom object

    @param debug - A boolean that, when true, causes Internal Server Error messages to be left in tact
    */
    reformat(debug: boolean): string

    /**
    Specifies if an error object is a valid boom object

    @param err - The error object

    @returns Returns a boolean stating if the error object is a valid boom object
    */
    static isBoom(err: Error): boolean

    /**
    Specifies if an error object is a valid boom object

    @param err - The error object to decorate
    @param options - Options object

    @returns A decorated boom object
    */
    static boomify<T>(err: Error, options?: Options<T>): Boom<T>

    // 4xx Errors

    /**
    Returns a 400 Bad Request error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 400 bad request error
    */
    static badRequest<T>(message?: string, data?: T): Boom<T>

    /**
    Returns a 401 Unauthorized error

    @param message - Optional message
    @param scheme - the authentication scheme name
    @param attributes - an object of values used to construct the 'WWW-Authenticate' header

    @returns A 401 Unauthorized error
    */
    static unauthorized<T>(message?: string | null, scheme?: string, attributes?: object | string): Boom<T>

    /**
    Returns a 401 Unauthorized error

    @param message - Optional message
    @param wwwAuthenticate - array of string values used to construct the wwwAuthenticate header

    @returns A 401 Unauthorized error
    */
    static unauthorized<T>(message: string | null, wwwAuthenticate: Array<string>): Boom<T>

    /**
    Returns a 402 Payment Required error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 402 Payment Required error
    */
    static paymentRequired<T>(message?: string, data?: T): Boom<T>

    /**
    Returns a 403 Forbidden error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 403 Forbidden error
    */
    static forbidden<T>(message?: string, data?: T): Boom<T>

    /**
    Returns a 404 Not Found error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 404 Not Found error
    */
    static notFound<T>(message?: string, data?: T): Boom<T>

    /**
    Returns a 405 Method Not Allowed error

    @param message - Optional message
    @param data - Optional additional error data
    @param allow - Optional string or array of strings which is used to set the 'Allow' header

    @returns A 405 Method Not Allowed error
    */
    static methodNotAllowed<T>(message?: string, data?: T, allow?: string | Array<string>): Boom<T>

    /**
    Returns a 406 Not Acceptable error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 406 Not Acceptable error
    */
    static notAcceptable<T>(message?: string, data?: T): Boom<T>

    /**
    Returns a 407 Proxy Authentication error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 407 Proxy Authentication error
    */
    static proxyAuthRequired<T>(message?: string, data?: T): Boom<T>

    /**
    Returns a 408 Request Time-out error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 408 Request Time-out error
    */
    static clientTimeout<T>(message?: string, data?: T): Boom<T>

    /**
    Returns a 409 Conflict error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 409 Conflict error
    */
    static conflict<T>(message?: string, data?: T): Boom<T>

    /**
    Returns a 410 Gone error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 410 gone error
    */
    static resourceGone<T>(message?: string, data?: T): Boom<T>

    /**
    Returns a 411 Length Required error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 411 Length Required error
    */
    static lengthRequired<T>(message?: string, data?: T): Boom<T>

    /**
    Returns a 412 Precondition Failed error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 412 Precondition Failed error
    */
    static preconditionFailed<T>(message?: string, data?: T): Boom<T>

    /**
    Returns a 413 Request Entity Too Large error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 413 Request Entity Too Large error
    */
    static entityTooLarge<T>(message?: string, data?: T): Boom<T>

    /**
    Returns a 414 Request-URI Too Large error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 414 Request-URI Too Large error
    */
    static uriTooLong<T>(message?: string, data?: T): Boom<T>

    /**
    Returns a 415 Unsupported Media Type error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 415 Unsupported Media Type error
    */
    static unsupportedMediaType<T>(message?: string, data?: T): Boom<T>

    /**
    Returns a 416 Request Range Not Satisfiable error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 416 Request Range Not Satisfiable error
    */
    static rangeNotSatisfiable<T>(message?: string, data?: T): Boom<T>

    /**
    Returns a 417 Expectation Failed error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 417 Expectation Failed error
    */
    static expectationFailed<T>(message?: string, data?: T): Boom<T>

    /**
    Returns a 418 I'm a Teapot error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 418 I'm a Teapot error
    */
    static teapot<T>(message?: string, data?: T): Boom<T>

    /**
    Returns a 422 Unprocessable Entity error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 422 Unprocessable Entity error
    */
    static badData<T>(message?: string, data?: T): Boom<T>

    /**
    Returns a 423 Locked error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 423 Locked error
    */
    static locked<T>(message?: string, data?: T): Boom<T>

    /**
    Returns a 424 Failed Dependency error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 424 Failed Dependency error
    */
    static failedDependency<T>(message?: string, data?: T): Boom<T>

    /**
    Returns a 428 Precondition Required error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 428 Precondition Required error
    */
    static preconditionRequired<T>(message?: string, data?: T): Boom<T>

    /**
    Returns a 429 Too Many Requests error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 429 Too Many Requests error
    */
    static tooManyRequests<T>(message?: string, data?: T): Boom<T>

    /**
    Returns a 451 Unavailable For Legal Reasons error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 451 Unavailable for Legal Reasons error
    */
    static illegal<T>(message?: string, data?: T): Boom<T>

    // 5xx Errors

    /**
    Returns a 500 Internal Server Error error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 500 Internal Server error
    */
    static badImplementation<T>(message?: string, data?: T): Boom<T>

    /**
    Returns a 501 Not Implemented error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 501 Not Implemented error
    */
    static notImplemented<T>(message?: string, data?: T): Boom<T>

    /**
    Returns a 502 Bad Gateway error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 502 Bad Gateway error
    */
    static badGateway<T>(message?: string, data?: T): Boom<T>

    /**
    Returns a 503 Service Unavailable error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 503 Service Unavailable error
    */
    static serverUnavailable<T>(message?: string, data?: T): Boom<T>

    /**
    Returns a 504 Gateway Time-out error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 504 Gateway Time-out error
    */
    static gatewayTimeout<T>(message?: string, data?: T): Boom<T>
}

export default Boom

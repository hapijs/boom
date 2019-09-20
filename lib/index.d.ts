declare namespace boom {

    interface Payload {
        /**
        The HTTP status code derived from error.output.statusCode
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

    interface Output {
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

    interface Options<Data, Decoration> {
        /**
        The HTTP status code

        @default 500
        */
        statusCode?: number

        /**
        Additional error information
        */
        data?: Data

        /**
        An option with extra properties to set on the error object
        */
        decorate?: Decoration

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

    interface MissingAuth {

        /**
        Indicate whether the 401 unauthorized error is due to missing credentials (vs. invalid)
        */
        isMissing: boolean
    }
}


export class Boom<Data = any, Decoration = object> extends Error {

    constructor(message?: string | Error, options?: boom.Options<Data, Decoration>)

    /**
    Custom error data with additional information specific to the error type
    */
    data: Data;

    /** isBoom - if true, indicates this is a Boom object instance. */
    isBoom: boolean;

    /**
    Convenience bool indicating status code >= 500
    */
    isServer: boolean;

    /**
    The error message
    */
    message: string;

    /**
    The formatted response
    */
    output: boom.Output;

    /**
    The constructor used to create the error
    */
    typeof: any;

    /**
    Specifies if an error object is a valid boom object

    @param debug - A boolean that, when true, does not hide the original 500 error message. Defaults to false.
    */
    reformat(debug?: boolean): string

    /**
    Specifies if an error object is a valid boom object

    @param err - The error object

    @returns Returns a boolean stating if the error object is a valid boom object
    */
    static isBoom(err: Error): err is Boom

    /**
    Specifies if an error object is a valid boom object

    @param err - The error object to decorate
    @param options - Options object

    @returns A decorated boom object
    */
    static boomify<Data, Decoration>(err: Error, options?: boom.Options<Data, Decoration>): Boom<Data> & Decoration

    // 4xx Errors

    /**
    Returns a 400 Bad Request error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 400 bad request error
    */
    static badRequest<Data>(message?: string, data?: Data): Boom<Data>

    /**
    Returns a 401 Unauthorized error

    @param message - Optional message
    @param scheme - the authentication scheme name
    @param attributes - an object of values used to construct the 'WWW-Authenticate' header

    @returns A 401 Unauthorized error
    */
    static unauthorized<Data>(message?: string | null, scheme?: string, attributes?: object | string): Boom<Data> & boom.MissingAuth

    /**
    Returns a 401 Unauthorized error

    @param message - Optional message
    @param wwwAuthenticate - array of string values used to construct the wwwAuthenticate header

    @returns A 401 Unauthorized error
    */
    static unauthorized<Data>(message: string | null, wwwAuthenticate: Array<string>): Boom<Data>

    /**
    Returns a 402 Payment Required error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 402 Payment Required error
    */
    static paymentRequired<Data>(message?: string, data?: Data): Boom<Data>

    /**
    Returns a 403 Forbidden error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 403 Forbidden error
    */
    static forbidden<Data>(message?: string, data?: Data): Boom<Data>

    /**
    Returns a 404 Not Found error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 404 Not Found error
    */
    static notFound<Data>(message?: string, data?: Data): Boom<Data>

    /**
    Returns a 405 Method Not Allowed error

    @param message - Optional message
    @param data - Optional additional error data
    @param allow - Optional string or array of strings which is used to set the 'Allow' header

    @returns A 405 Method Not Allowed error
    */
    static methodNotAllowed<Data>(message?: string, data?: Data, allow?: string | Array<string>): Boom<Data>

    /**
    Returns a 406 Not Acceptable error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 406 Not Acceptable error
    */
    static notAcceptable<Data>(message?: string, data?: Data): Boom<Data>

    /**
    Returns a 407 Proxy Authentication error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 407 Proxy Authentication error
    */
    static proxyAuthRequired<Data>(message?: string, data?: Data): Boom<Data>

    /**
    Returns a 408 Request Time-out error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 408 Request Time-out error
    */
    static clientTimeout<Data>(message?: string, data?: Data): Boom<Data>

    /**
    Returns a 409 Conflict error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 409 Conflict error
    */
    static conflict<Data>(message?: string, data?: Data): Boom<Data>

    /**
    Returns a 410 Gone error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 410 gone error
    */
    static resourceGone<Data>(message?: string, data?: Data): Boom<Data>

    /**
    Returns a 411 Length Required error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 411 Length Required error
    */
    static lengthRequired<Data>(message?: string, data?: Data): Boom<Data>

    /**
    Returns a 412 Precondition Failed error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 412 Precondition Failed error
    */
    static preconditionFailed<Data>(message?: string, data?: Data): Boom<Data>

    /**
    Returns a 413 Request Entity Too Large error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 413 Request Entity Too Large error
    */
    static entityTooLarge<Data>(message?: string, data?: Data): Boom<Data>

    /**
    Returns a 414 Request-URI Too Large error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 414 Request-URI Too Large error
    */
    static uriTooLong<Data>(message?: string, data?: Data): Boom<Data>

    /**
    Returns a 415 Unsupported Media Type error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 415 Unsupported Media Type error
    */
    static unsupportedMediaType<Data>(message?: string, data?: Data): Boom<Data>

    /**
    Returns a 416 Request Range Not Satisfiable error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 416 Request Range Not Satisfiable error
    */
    static rangeNotSatisfiable<Data>(message?: string, data?: Data): Boom<Data>

    /**
    Returns a 417 Expectation Failed error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 417 Expectation Failed error
    */
    static expectationFailed<Data>(message?: string, data?: Data): Boom<Data>

    /**
    Returns a 418 I'm a Teapot error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 418 I'm a Teapot error
    */
    static teapot<Data>(message?: string, data?: Data): Boom<Data>

    /**
    Returns a 422 Unprocessable Entity error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 422 Unprocessable Entity error
    */
    static badData<Data>(message?: string, data?: Data): Boom<Data>

    /**
    Returns a 423 Locked error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 423 Locked error
    */
    static locked<Data>(message?: string, data?: Data): Boom<Data>

    /**
    Returns a 424 Failed Dependency error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 424 Failed Dependency error
    */
    static failedDependency<Data>(message?: string, data?: Data): Boom<Data>

    /**
    Returns a 428 Precondition Required error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 428 Precondition Required error
    */
    static preconditionRequired<Data>(message?: string, data?: Data): Boom<Data>

    /**
    Returns a 429 Too Many Requests error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 429 Too Many Requests error
    */
    static tooManyRequests<Data>(message?: string, data?: Data): Boom<Data>

    /**
    Returns a 451 Unavailable For Legal Reasons error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 451 Unavailable for Legal Reasons error
    */
    static illegal<Data>(message?: string, data?: Data): Boom<Data>

    // 5xx Errors

    /**
    Returns a 500 Internal Server Error error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 500 Internal Server error
    */
    static badImplementation<Data>(message?: string, data?: Data): Boom<Data>

    /**
    Returns a 501 Not Implemented error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 501 Not Implemented error
    */
    static notImplemented<Data>(message?: string, data?: Data): Boom<Data>

    /**
    Returns a 502 Bad Gateway error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 502 Bad Gateway error
    */
    static badGateway<Data>(message?: string, data?: Data): Boom<Data>

    /**
    Returns a 503 Service Unavailable error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 503 Service Unavailable error
    */
    static serverUnavailable<Data>(message?: string, data?: Data): Boom<Data>

    /**
    Returns a 504 Gateway Time-out error

    @param message - Optional message
    @param data - Optional additional error data

    @returns A 504 Gateway Time-out error
    */
    static gatewayTimeout<Data>(message?: string, data?: Data): Boom<Data>
}

export default Boom

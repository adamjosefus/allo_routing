// deno-lint-ignore-file camelcase
export const enum Status {
    S100_Continue = 100,
    S101_SwitchingProtocols = 101,
    S102_Processing = 102,
    S200_Ok = 200,
    S201_Created = 201,
    S202_Accepted = 202,
    S203_NonAuthoritativeInformation = 203,
    S204_NoContent = 204,
    S205_ResetContent = 205,
    S206_PartialContent = 206,
    S207_MultiStatus = 207,
    S208_AlreadyReported = 208,
    S226_ImUsed = 226,
    S300_MultipleChoices = 300,
    S301_MovedPermanently = 301,
    S302_Found = 302,
    S303_SeeOther = 303,
    S304_NotModified = 304,
    S305_UseProxy = 305,
    S307_TemporaryRedirect = 307,
    S308_PermanentRedirect = 308,
    S400_BadRequest = 400,
    S401_Unauthorized = 401,
    S402_PaymentRequired = 402,
    S403_Forbidden = 403,
    S404_NotFound = 404,
    S405_MethodNotAllowed = 405,
    S406_NotAcceptable = 406,
    S407_ProxyAuthenticationRequired = 407,
    S408_RequestTimeout = 408,
    S409_Conflict = 409,
    S410_Gone = 410,
    S411_LengthRequired = 411,
    S412_PreconditionFailed = 412,
    S413_RequestEntityTooLarge = 413,
    S414_RequestUriTooLong = 414,
    S415_UnsupportedMediaType = 415,
    S416_RequestedRangeNotSatisfiable = 416,
    S417_ExpectationFailed = 417,
    S421_MisdirectedRequest = 421,
    S422_UnprocessableEntity = 422,
    S423_Locked = 423,
    S424_FailedDependency = 424,
    S426_UpgradeRequired = 426,
    S428_PreconditionRequired = 428,
    S429_TooManyRequests = 429,
    S431_RequestHeaderFieldsTooLarge = 431,
    S451_UnavailableForLegalReasons = 451,
    S500_InternalServerError = 500,
    S501_NotImplemented = 501,
    S502_BadGateway = 502,
    S503_ServiceUnavailable = 503,
    S504_GatewayTimeout = 504,
    S505_HttpVersionNotSupported = 505,
    S506_VariantAlsoNegotiates = 506,
    S507_InsufficientStorage = 507,
    S508_LoopDetected = 508,
    S510_NotExtended = 510,
    S511_NetworkAuthenticationRequired = 511,
}


export function getReasonPhrase(status: number): string {
    switch (status) {
        case Status.S100_Continue:
            return 'Continue';

        case Status.S101_SwitchingProtocols:
            return 'Switching Protocols';

        case Status.S102_Processing:
            return 'Processing';

        case Status.S200_Ok:
            return 'OK';

        case Status.S201_Created:
            return 'Created';

        case Status.S202_Accepted:
            return 'Accepted';

        case Status.S203_NonAuthoritativeInformation:
            return 'Non-Authoritative Information';

        case Status.S204_NoContent:
            return 'No Content';

        case Status.S205_ResetContent:
            return 'Reset Content';

        case Status.S206_PartialContent:
            return 'Partial Content';

        case Status.S207_MultiStatus:
            return 'Multi-status';

        case Status.S208_AlreadyReported:
            return 'Already Reported';

        case Status.S226_ImUsed:
            return 'IM Used';

        case Status.S300_MultipleChoices:
            return 'Multiple Choices';

        case Status.S301_MovedPermanently:
            return 'Moved Permanently';

        case Status.S302_Found:
            return 'Found';

        case Status.S303_SeeOther:
            return 'See Other';

        case Status.S304_NotModified:
            return 'Not Modified';

        case Status.S305_UseProxy:
            return 'Use Proxy';

        case Status.S307_TemporaryRedirect:
            return 'Temporary Redirect';

        case Status.S308_PermanentRedirect:
            return 'Permanent Redirect';

        case Status.S400_BadRequest:
            return 'Bad Request';

        case Status.S401_Unauthorized:
            return 'Unauthorized';

        case Status.S402_PaymentRequired:
            return 'Payment Required';

        case Status.S403_Forbidden:
            return 'Forbidden';

        case Status.S404_NotFound:
            return 'Not Found';

        case Status.S405_MethodNotAllowed:
            return 'Method Not Allowed';

        case Status.S406_NotAcceptable:
            return 'Not Acceptable';

        case Status.S407_ProxyAuthenticationRequired:
            return 'Proxy Authentication Required';

        case Status.S408_RequestTimeout:
            return 'Request Time-out';

        case Status.S409_Conflict:
            return 'Conflict';

        case Status.S410_Gone:
            return 'Gone';

        case Status.S411_LengthRequired:
            return 'Length Required';

        case Status.S412_PreconditionFailed:
            return 'Precondition Failed';

        case Status.S413_RequestEntityTooLarge:
            return 'Request Entity Too Large';

        case Status.S414_RequestUriTooLong:
            return 'Request-URI Too Large';

        case Status.S415_UnsupportedMediaType:
            return 'Unsupported Media Type';

        case Status.S416_RequestedRangeNotSatisfiable:
            return 'Requested range not satisfiable';

        case Status.S417_ExpectationFailed:
            return 'Expectation Failed';

        case Status.S421_MisdirectedRequest:
            return 'Misdirected Request';

        case Status.S422_UnprocessableEntity:
            return 'Unprocessable Entity';

        case Status.S423_Locked:
            return 'Locked';

        case Status.S424_FailedDependency:
            return 'Failed Dependency';

        case Status.S426_UpgradeRequired:
            return 'Upgrade Required';

        case Status.S428_PreconditionRequired:
            return 'Precondition Required';

        case Status.S429_TooManyRequests:
            return 'Too Many Requests';

        case Status.S431_RequestHeaderFieldsTooLarge:
            return 'Request Header Fields Too Large';

        case Status.S451_UnavailableForLegalReasons:
            return 'Unavailable For Legal Reasons';

        case Status.S500_InternalServerError:
            return 'Internal Server Error';

        case Status.S501_NotImplemented:
            return 'Not Implemented';

        case Status.S502_BadGateway:
            return 'Bad Gateway';

        case Status.S503_ServiceUnavailable:
            return 'Service Unavailable';

        case Status.S504_GatewayTimeout:
            return 'Gateway Time-out';

        case Status.S505_HttpVersionNotSupported:
            return 'HTTP Version not supported';

        case Status.S506_VariantAlsoNegotiates:
            return 'Variant Also Negotiates';

        case Status.S507_InsufficientStorage:
            return 'Insufficient Storage';

        case Status.S508_LoopDetected:
            return 'Loop Detected';

        case Status.S510_NotExtended:
            return 'Not Extended';

        case Status.S511_NetworkAuthenticationRequired:
            return 'Network Authentication Required';

        default:
            return 'Unknown status.'
    }
}

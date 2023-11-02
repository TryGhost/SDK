// NOTE: this module is here to serve as a dummy fixture for GhostError errors (@tryghost/errors)

interface ErrorOptions {
    errorType?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errorDetails?: Record<string, any>;
    message?: string;
}

class Error {
    protected errorType?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected errorDetails?: Record<string, any>;
    protected message?: string;

    constructor({errorType, errorDetails, message}: ErrorOptions) {
        this.errorType = errorType;
        this.errorDetails = errorDetails;
        this.message = message;
    }
}

export class IncorrectUsageError extends Error {
    constructor(options: ErrorOptions) {
        super(Object.assign({errorType: 'IncorrectUsageError'}, options));
    }
}

export class HostLimitError extends Error {
    constructor(options: ErrorOptions) {
        super(Object.assign({errorType: 'HostLimitError'}, options));
    }
}

export default {IncorrectUsageError, HostLimitError};

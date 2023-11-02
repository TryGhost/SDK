// There are a lot of places
/* eslint-disable @typescript-eslint/no-explicit-any */
import {lastPeriodStart, SUPPORTED_INTERVALS} from './date-utils';
import {CurrentCountFn, LimitConfig, LimitServiceErrors} from './LimitService';

const interpolate = /{{([\s\S]+?)}}/g;
const template = (message: string, substitutions: Record<string, string>) => message.replace(interpolate, (_, key) => substitutions[key.trim()]);
const lowerCase = (name: string) => name.replace(/[A-Z]/, letter => ` ${letter.toLowerCase()}`);

interface ErrorDetails {
    message?: string;
    errorDetails: {
        name: string;
        limit?: number;
        total?: number;
    };
    help?: string;
}

class Limit {
    protected name: string;
    protected error: string;
    protected helpLink?: string;
    protected db?: any;
    protected errors: LimitServiceErrors;

    /**
     *
     * @param options
     * @param options.name - name of the limit
     * @param options.error - error message to use when limit is reached
     * @param options.helpLink - URL to the resource explaining how the limit works
     * @param options.db - instance of knex db connection that currentCountQuery can use to run state check through
     * @param options.errors - instance of errors compatible with GhostError errors (@tryghost/errors)
     */
    constructor({name, error, helpLink, db, errors}: {
        name: string;
        error: string;
        helpLink?: string;
        db?: any;
        errors: LimitServiceErrors;
    }) {
        this.name = name;
        this.error = error;
        this.helpLink = helpLink;
        this.db = db;
        this.errors = errors;
    }

    generateBaseError(): ErrorDetails {
        const errorObj: ErrorDetails = {
            errorDetails: {
                name: this.name
            }
        };

        if (this.helpLink) {
            errorObj.help = this.helpLink;
        }

        return errorObj;
    }
}

export class MaxLimit extends Limit {
    protected currentCountQueryFn: CurrentCountFn;
    protected max: number;
    protected formatter?: (count: number) => string;
    protected fallbackMessage: string;

    /**
     *
     * @param options
     * @param options.name - name of the limit
     * @param options.config - limit configuration
     * @param options.config.max - maximum limit the limit would check against
     * @param options.config.currentCountQuery - query checking the state that would be compared against the limit
     * @param options.config.formatter - function to format the limit counts before they are passed to the error message
     * @param options.config.error - error message to use when limit is reached
     * @param options.helpLink - URL to the resource explaining how the limit works
     * @param options.db - instance of knex db connection that currentCountQuery can use to run state check through
     * @param options.errors - instance of errors compatible with GhostError errors (@tryghost/errors)
     */
    constructor({name, config, helpLink, db, errors}: {
        name: string;
        config: LimitConfig;
        helpLink?: string;
        db?: any;
        errors: LimitServiceErrors;
    }) {
        super({name, error: config.error || '', helpLink, db, errors});

        if (config.max === undefined) {
            throw new errors.IncorrectUsageError({message: 'Attempted to setup a max limit without a limit'});
        }

        if (!config.currentCountQuery) {
            throw new errors.IncorrectUsageError({message: 'Attempted to setup a max limit without a current count query'});
        }

        this.currentCountQueryFn = config.currentCountQuery;
        this.max = config.max;
        this.formatter = config.formatter;
        this.fallbackMessage = `This action would exceed the ${lowerCase(this.name)} limit on your current plan.`;
    }

    /**
     *
     * @param count - current count that acceded the limit
     * @returns {Object} instance of HostLimitError
     */
    generateError(count: number) {
        const errorObj = super.generateBaseError();

        errorObj.message = this.fallbackMessage;

        if (this.error) {
            const formatter = this.formatter || Intl.NumberFormat().format;
            try {
                errorObj.message = template(this.error, {
                    max: formatter(this.max),
                    count: formatter(count),
                    name: this.name
                });
            } catch (e) {
                errorObj.message = this.fallbackMessage;
            }
        }

        errorObj.errorDetails.limit = this.max;
        errorObj.errorDetails.total = count;

        return new this.errors.HostLimitError(errorObj);
    }

    /**
     * @param options.transacting Transaction to run the count query on
     * @returns
     */
    async currentCountQuery(options: {transacting?: any} = {}) {
        return await this.currentCountQueryFn(options.transacting ?? this.db?.knex);
    }

    /**
     * Throws a HostLimitError if the configured or passed max limit is acceded by currentCountQuery
     *
     * @param {Object} options
     * @param {Number} [options.max] - overrides configured default max value to perform checks against
     * @param {Number} [options.addedCount] - number of items to add to the currentCount during the check
     * @param {Object} [options.transacting] Transaction to run the count query on
     */
    async errorIfWouldGoOverLimit(options: {
        max?: number;
        addedCount?: number;
        transacting?: any;
    } = {}) {
        const {max, addedCount = 1} = options;
        const currentCount = await this.currentCountQuery(options) || 0;

        if ((currentCount + addedCount) > (max || this.max)) {
            throw this.generateError(currentCount);
        }
    }

    /**
     * Throws a HostLimitError if the configured or passed max limit is acceded by currentCountQuery
     *
     * @param {Object} options
     * @param {Number} [options.max] - overrides configured default max value to perform checks against
     * @param {Number} [options.currentCount] - overrides currentCountQuery to perform checks against
     * @param {Object} [options.transacting] Transaction to run the count query on
     */
    async errorIfIsOverLimit(options: {
        max?: number;
        currentCount?: number;
        transacting?: any;
    } = {}) {
        const currentCount = options.currentCount || await this.currentCountQuery(options) || 0;

        if (currentCount > (options.max || this.max)) {
            throw this.generateError(currentCount);
        }
    }
}

export class MaxPeriodicLimit extends Limit {
    protected currentCountQueryFn: CurrentCountFn;
    protected maxPeriodic: number;
    protected interval: 'month';
    protected startDate: string;
    protected fallbackMessage: string;

    /**
     *
     * @param {Object} options
     * @param {String} options.name - name of the limit
     * @param {Object} options.config - limit configuration
     * @param {Number} options.config.maxPeriodic - maximum limit the limit would check against
     * @param {String} options.config.error - error message to use when limit is reached
     * @param {Function} options.config.currentCountQuery - query checking the state that would be compared against the limit
     * @param {('month')} options.config.interval - an interval to take into account when checking the limit. Currently only supports 'month' value
     * @param {String} options.config.startDate - start date in ISO 8601 format (https://en.wikipedia.org/wiki/ISO_8601), used to calculate period intervals
     * @param {String} options.helpLink - URL to the resource explaining how the limit works
     * @param {Object} [options.db] - instance of knex db connection that currentCountQuery can use to run state check through
     * @param {Object} options.errors - instance of errors compatible with GhostError errors (@tryghost/errors)
     */
    constructor({name, config, helpLink, db, errors}: {
        name: string;
        config: LimitConfig & {
            interval?: 'month';
            startDate?: string;
        };
        helpLink?: string;
        db?: any;
        errors: LimitServiceErrors;
    }) {
        super({name, error: config.error || '', helpLink, db, errors});

        if (config.maxPeriodic === undefined) {
            throw new errors.IncorrectUsageError({message: 'Attempted to setup a periodic max limit without a limit'});
        }

        if (!config.currentCountQuery) {
            throw new errors.IncorrectUsageError({message: 'Attempted to setup a periodic max limit without a current count query'});
        }

        if (!config.interval) {
            throw new errors.IncorrectUsageError({message: 'Attempted to setup a periodic max limit without an interval'});
        }

        if (!SUPPORTED_INTERVALS.includes(config.interval)) {
            throw new errors.IncorrectUsageError({message: `Attempted to setup a periodic max limit without unsupported interval. Please specify one of: ${SUPPORTED_INTERVALS}`});
        }

        if (!config.startDate) {
            throw new errors.IncorrectUsageError({message: 'Attempted to setup a periodic max limit without a start date'});
        }

        this.currentCountQueryFn = config.currentCountQuery;
        this.maxPeriodic = config.maxPeriodic;
        this.interval = config.interval;
        this.startDate = config.startDate;
        this.fallbackMessage = `This action would exceed the ${lowerCase(this.name)} limit on your current plan.`;
    }

    generateError(count: number) {
        const errorObj = super.generateBaseError();

        errorObj.message = this.fallbackMessage;

        if (this.error) {
            try {
                errorObj.message = template(this.error, {
                    max: Intl.NumberFormat().format(this.maxPeriodic),
                    count: Intl.NumberFormat().format(count),
                    name: this.name
                });
            } catch (e) {
                errorObj.message = this.fallbackMessage;
            }
        }

        errorObj.errorDetails.limit = this.maxPeriodic;
        errorObj.errorDetails.total = count;

        return new this.errors.HostLimitError(errorObj);
    }

    /**
     * @param {Object} [options]
     * @param {Object} [options.transacting] Transaction to run the count query on
     * @returns
     */
    async currentCountQuery(options: {transacting?: any} = {}) {
        const lastPeriodStartDate = lastPeriodStart(this.startDate, this.interval);

        return await this.currentCountQueryFn(options.transacting ? options.transacting : (this.db ? this.db.knex : undefined), lastPeriodStartDate || undefined);
    }

    /**
     * Throws a HostLimitError if the configured or passed max limit is acceded by currentCountQuery
     *
     * @param {Object} options
     * @param {Number} [options.max] - overrides configured default maxPeriodic value to perform checks against
     * @param {Number} [options.addedCount] - number of items to add to the currentCount during the check
     * @param {Object} [options.transacting] Transaction to run the count query on
     */
    async errorIfWouldGoOverLimit(options: {
        max?: number;
        addedCount?: number;
        transacting?: any;
    } = {}) {
        const {max, addedCount = 1} = options;
        const currentCount = await this.currentCountQuery(options) || 0;

        if ((currentCount + addedCount) > (max || this.maxPeriodic)) {
            throw this.generateError(currentCount);
        }
    }

    /**
     * Throws a HostLimitError if the configured or passed max limit is acceded by currentCountQuery
     *
     * @param {Object} options
     * @param {Number} [options.max] - overrides configured default maxPeriodic value to perform checks against
     * @param {Object} [options.transacting] Transaction to run the count query on
     */
    async errorIfIsOverLimit(options: {
        max?: number;
        transacting?: any;
    } = {}) {
        const {max} = options;
        const currentCount = await this.currentCountQuery(options) || 0;

        if (currentCount > (max || this.maxPeriodic)) {
            throw this.generateError(currentCount);
        }
    }
}

export class FlagLimit extends Limit {
    protected disabled?: boolean;
    protected fallbackMessage: string;

    /**
     *
     * @param {Object} options
     * @param {String} options.name - name of the limit
     * @param {Object} options.config - limit configuration
     * @param {Number} options.config.disabled - disabled/enabled flag for the limit
     * @param {String} options.config.error - error message to use when limit is reached
     * @param {String} options.helpLink - URL to the resource explaining how the limit works
     * @param {Object} [options.db] - instance of knex db connection that currentCountQuery can use to run state check through
     * @param {Object} options.errors - instance of errors compatible with GhostError errors (@tryghost/errors)
     */
    constructor({name, config, helpLink, db, errors}: {
        name: string;
        config: LimitConfig & {
            disabled?: boolean;
        };
        helpLink?: string;
        db?: any;
        errors: LimitServiceErrors;
    }) {
        super({name, error: config.error || '', helpLink, db, errors});

        this.disabled = config.disabled;
        this.fallbackMessage = `Your plan does not support ${lowerCase(this.name)}. Please upgrade to enable ${lowerCase(this.name)}.`;
    }

    generateError() {
        const errorObj = super.generateBaseError();

        if (this.error) {
            errorObj.message = this.error;
        } else {
            errorObj.message = this.fallbackMessage;
        }

        return new this.errors.HostLimitError(errorObj);
    }

    /**
     * Flag limits are on/off so using a feature is always over the limit
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async errorIfWouldGoOverLimit(_options?: any) {
        if (this.disabled) {
            throw this.generateError();
        }
    }

    /**
     * Flag limits are on/off. They don't necessarily mean the limit wasn't possible to reach
     * NOTE: this method should not be relied on as it's impossible to check the limit was surpassed!
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async errorIfIsOverLimit(_options?: any) {
        return;
    }
}

export class AllowlistLimit extends Limit {
    protected allowlist: string[];
    protected fallbackMessage: string;

    /**
     *
     * @param {Object} options
     * @param {String} options.name - name of the limit
     * @param {Object} options.config - limit configuration
     * @param {[String]} options.config.allowlist - allowlist values that would be compared against
     * @param {String} options.config.error - error message to use when limit is reached
     * @param {String} options.helpLink - URL to the resource explaining how the limit works
     * @param {Object} options.errors - instance of errors compatible with GhostError errors (@tryghost/errors)
     */
    constructor({name, config, helpLink, errors}: {
        name: string;
        config: LimitConfig & {
            allowlist?: string[];
        };
        helpLink?: string;
        errors: LimitServiceErrors;
    }) {
        super({name, error: config.error || '', helpLink, errors});

        if (!config.allowlist || !config.allowlist.length) {
            throw new this.errors.IncorrectUsageError({message: 'Attempted to setup an allowlist limit without an allowlist'});
        }

        this.allowlist = config.allowlist;
        this.fallbackMessage = `This action would exceed the ${lowerCase(this.name)} limit on your current plan.`;
    }

    generateError() {
        const errorObj = super.generateBaseError();

        if (this.error) {
            errorObj.message = this.error;
        } else {
            errorObj.message = this.fallbackMessage;
        }

        return new this.errors.HostLimitError(errorObj);
    }

    async errorIfWouldGoOverLimit(metadata?: {
        value?: string;
    }) {
        if (!metadata || !metadata.value) {
            throw new this.errors.IncorrectUsageError({message: 'Attempted to check an allowlist limit without a value'});
        }
        if (!this.allowlist.includes(metadata.value)) {
            throw this.generateError();
        }
    }

    async errorIfIsOverLimit(metadata?: {
        value?: string;
    }) {
        if (!metadata || !metadata.value) {
            throw new this.errors.IncorrectUsageError({message: 'Attempted to check an allowlist limit without a value'});
        }
        if (!this.allowlist.includes(metadata.value)) {
            throw this.generateError();
        }
    }
}

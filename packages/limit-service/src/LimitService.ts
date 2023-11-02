import {IncorrectUsageError} from '@tryghost/errors';
import config from './config';
import {AllowlistLimit, FlagLimit, MaxLimit, MaxPeriodicLimit} from './limit';

const messages = {
    missingErrorsConfig: `Config Missing: 'errors' is required.`,
    noSubscriptionParameter: 'Attempted to setup a periodic max limit without a subscription'
};

const camelCase = (str: string) => {
    if (!str) {
        return '';
    }

    const result = str.replace(/[^A-Z]+(.)/ig, (_, character) => character.toUpperCase());
    return result[0].toLowerCase() + result.slice(1);
};

type Limits = Record<string, AllowlistLimit | FlagLimit | MaxLimit | MaxPeriodicLimit>

export interface LimitServiceErrors {
    IncorrectUsageError: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new(options: {message?: string}): any;
    }
    HostLimitError: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new(options: {message?: string}): any;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CurrentCountFn = (knex?: any, lastPeriodStart?: string) => Promise<number | undefined>

export interface LimitConfig {
    /** max limit */
    max?: number;

    /** max limit for a period */
    maxPeriodic?: number;

    /** flag disabling/enabling limit */
    disabled?: boolean;

    /** custom error to be displayed when the limit is reached */
    error?: string;

    /** function returning count for the "max" type of limit */
    currentCountQuery?: CurrentCountFn;

    /** function to format the limit counts before they are passed to the error message */
    formatter?: (count: number) => string;

    /** allowlist values that would be compared against */
    allowlist?: string[];
}

export default class LimitService {
    public limits: Limits;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private errors?: LimitServiceErrors;

    constructor() {
        this.limits = {};
    }

    /**
     * Initializes the limits based on configuration
     *
     * @param options
     * @param options.limits - hash containing limit configurations keyed by limit name and containing
     * @param options.subscription - hash containing subscription configuration with interval and startDate properties
     * @param options.helpLink - URL pointing to help resources for when limit is reached
     * @param options.db - knex db connection instance or other data source for the limit checks
     * @param options.errors - instance of errors compatible with GhostError errors (@tryghost/errors)
     */
    loadLimits({limits = {}, subscription, helpLink, db, errors}: {
        limits: Record<string, LimitConfig>;
        subscription?: {
            interval: 'month';
            startDate: string;
        };
        helpLink?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        db?: any;
        errors?: LimitServiceErrors;
    }) {
        if (!errors) {
            throw new IncorrectUsageError({
                message: messages.missingErrorsConfig
            });
        }

        this.errors = errors;

        // CASE: reset internal limits state in case load is called multiple times
        this.limits = {};

        Object.keys(limits).forEach((name) => {
            name = camelCase(name);

            // NOTE: config module acts as an allowlist of supported config names, where each key is a name of supported config
            if (config[name]) {
                const limitConfig: LimitConfig = Object.assign({}, config[name], limits[name]);

                if ('allowlist' in limitConfig) {
                    this.limits[name] = new AllowlistLimit({name, config: limitConfig, helpLink, errors});
                } else if ('max' in limitConfig) {
                    this.limits[name] = new MaxLimit({name: name, config: limitConfig, helpLink, db, errors});
                } else if ('maxPeriodic' in limitConfig) {
                    if (subscription === undefined) {
                        throw new IncorrectUsageError({
                            message: messages.noSubscriptionParameter
                        });
                    }

                    const maxPeriodicLimitConfig = Object.assign({}, limitConfig, subscription);
                    this.limits[name] = new MaxPeriodicLimit({name: name, config: maxPeriodicLimitConfig, helpLink, db, errors});
                } else {
                    this.limits[name] = new FlagLimit({name: name, config: limitConfig, helpLink, errors});
                }
            }
        });
    }

    isLimited(limitName: string) {
        return !!this.limits[camelCase(limitName)];
    }

    /**
     *
     * @param limitName - name of the configured limit
     * @param options - limit parameters
     * @param options.transacting Transaction to run the count query on (if required for the chosen limit)
     * @returns
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async checkIsOverLimit(limitName: string, options: any = {}) {
        if (!this.isLimited(limitName)) {
            return;
        }

        try {
            await this.limits[limitName].errorIfIsOverLimit(options);
            return false;
        } catch (error) {
            if (error instanceof this.errors!.HostLimitError) {
                return true;
            }

            throw error;
        }
    }

    /**
     *
     * @param {String} limitName - name of the configured limit
     * @param {Object} [options] - limit parameters
     * @param {Object} [options.transacting] Transaction to run the count query on (if required for the chosen limit)
     * @returns
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async checkWouldGoOverLimit(limitName: string, options: any = {}) {
        if (!this.isLimited(limitName)) {
            return;
        }

        try {
            await this.limits[limitName].errorIfWouldGoOverLimit(options);
            return false;
        } catch (error) {
            if (error instanceof this.errors!.HostLimitError) {
                return true;
            }

            throw error;
        }
    }

    /**
     *
     * @param limitName - name of the configured limit
     * @param options - limit parameters
     * @param options.transacting Transaction to run the count query on (if required for the chosen limit)
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async errorIfIsOverLimit(limitName: string, options: any = {}) {
        if (!this.isLimited(limitName)) {
            return;
        }

        await this.limits[limitName].errorIfIsOverLimit(options);
    }

    /**
     *
     * @param limitName - name of the configured limit
     * @param options - limit parameters
     * @param options.transacting Transaction to run the count query on (if required for the chosen limit)
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async errorIfWouldGoOverLimit(limitName: string, options: any = {}) {
        if (!this.isLimited(limitName)) {
            return;
        }

        await this.limits[limitName].errorIfWouldGoOverLimit(options);
    }

    /**
     * Checks if any of the configured limits acceded
     *
     * @param options - limit parameters
     * @param options.transacting Transaction to run the count queries on (if required for the chosen limit)
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async checkIfAnyOverLimit(options: any = {}) {
        for (const limit in this.limits) {
            if (await this.checkIsOverLimit(limit, options)) {
                return true;
            }
        }

        return false;
    }
}

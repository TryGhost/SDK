import errors from '@tryghost/errors';
import {DateTime} from 'luxon';

const messages = {
    invalidInterval: 'Invalid interval specified. Only "month" value is accepted.'
};

export const SUPPORTED_INTERVALS = ['month'];

/**
 * Calculates the start of the last period (billing, cycle, etc.) based on the start date
 * and the interval at which the cycle renews.
 *
 * @param startDate - date in ISO 8601 format (https://en.wikipedia.org/wiki/ISO_8601)
 * @param interval - currently only supports 'month' value, in the future might support 'year', etc.
 *
 * @returns - date in ISO 8601 format (https://en.wikipedia.org/wiki/ISO_8601) of the last period start
 */
export const lastPeriodStart = (startDate: string, interval: 'month'): string | null => {
    if (interval === 'month') {
        const startDateISO = DateTime.fromISO(startDate, {zone: 'UTC'});
        const now = DateTime.now().setZone('UTC');
        const fullPeriodsPast = Math.floor(now.diff(startDateISO, 'months').months);

        const lastPeriodStartDate = startDateISO.plus({months: fullPeriodsPast});

        return lastPeriodStartDate.toISO();
    }

    throw new errors.IncorrectUsageError({
        message: messages.invalidInterval
    });
};

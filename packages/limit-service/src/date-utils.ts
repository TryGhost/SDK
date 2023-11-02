import {IncorrectUsageError} from '@tryghost/errors';
import {differenceInMonths} from 'date-fns';

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
        const startDateISO = new Date(startDate);
        const now = new Date();

        const fullPeriodsPast = Math.abs(Math.floor(differenceInMonths(startDateISO, now)));

        return addMonths(startDateISO, fullPeriodsPast).toISOString();
    }

    throw new IncorrectUsageError({
        message: messages.invalidInterval
    });
};

const addMonths = (date: Date, months: number) => {
    const endOfTargetMonth = new Date(date);
    endOfTargetMonth.setUTCMonth(endOfTargetMonth.getUTCMonth() + months + 1, 0);

    const daysInTargetMonth = endOfTargetMonth.getUTCDate();

    // Just using setUTCMonth can end up with the wrong month if the target month has fewer days than the original month
    if (date.getUTCDate() >= daysInTargetMonth) {
        return endOfTargetMonth;
    } else {
        const newDate = new Date(date);
        newDate.setUTCMonth(newDate.getUTCMonth() + months);
        return newDate;
    }
};

// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const sinon = require('sinon');
const moment = require('moment-timezone');
const replacePermalink = require('../../../lib/utils/replace-permalink').default;
const legacy = require('../../utils/legacy/replace-permalink');

const permalinks = [
    '/:slug/',
    '/:year/:month/:day/:slug/',
    '/:year/:id/',
    '/:year/:month/:slug/',
    '/:primary_tag/:slug/',
    '/:primary_author/:slug/',
    '/:author/:slug/',
    '/:unknown/:slug/',
    '/:constructor/:toString/:slug/',
    '/blog/:slug:id/',
    '/no-tokens/',
    '/:Year/:slug/',
    ''
];

const timezones = [
    undefined,
    'UTC',
    'Europe/Berlin',
    'America/Los_Angeles',
    'Pacific/Kiritimati',
    'Pacific/Pago_Pago',
    'Pacific/Apia',
    'Asia/Kolkata',
    'Australia/Lord_Howe',
    'Etc/GMT+12',
    'US/Pacific',
    'europe/berlin',
    // offsets fall back to UTC, whether or not Intl accepts them
    '+01:00',
    '-05:30'
];

const publishedAts = [
    // date-line edges, Kiritimati is UTC+14 and Pago Pago UTC-11
    new Date('2016-05-18T06:30:00.000Z'),
    new Date('2016-05-17T09:59:59.999Z'),
    new Date('2016-05-17T10:00:00.000Z'),
    new Date('2016-05-17T11:00:00.000Z'),
    new Date('2016-05-17T12:00:00.000Z'),
    new Date('2016-05-17T23:59:59.999Z'),
    new Date('2016-12-31T23:30:00.000Z'),
    new Date('2017-01-01T00:30:00.000Z'),
    // DST transitions
    new Date('2021-03-28T00:30:00.000Z'),
    new Date('2021-03-28T01:30:00.000Z'),
    new Date('2021-11-07T07:30:00.000Z'),
    new Date('2021-11-07T08:30:00.000Z'),
    // Apia skipped 30th Dec 2011, Kiritimati skipped 31st Dec 1994
    new Date('2011-12-29T10:30:00.000Z'),
    new Date('2011-12-30T10:30:00.000Z'),
    new Date('1994-12-30T10:30:00.000Z'),
    new Date('1994-12-31T10:30:00.000Z'),
    // outside the Intl fast path range
    new Date('1899-12-31T23:30:00.000Z'),
    new Date('1066-10-14T12:00:00.000Z'),
    new Date('9999-12-31T12:00:00.000Z'),
    new Date('+010000-01-01T12:00:00.000Z'),
    new Date('-000001-06-15T12:00:00.000Z'),
    new Date('0999-06-15T12:00:00.000Z'),
    new Date('invalid'),
    1463553000000,
    1463553000000.7,
    NaN,
    0,
    '2016-05-17T23:30:00.000Z',
    '2016-05-17T23:30:00Z',
    '2016-05-17T23:30Z',
    '2016-05-17T23:30:00.000+02:00',
    '2016-05-17T23:30:00.000-11:00',
    '2016-05-17T23:30:00.123456Z',
    '2016-05-17T23:30:00',
    '2016-05-17 23:30:00',
    '2016-05-17',
    'not a date',
    ...[
        // comma fractions, hour-only times and fractions beyond milliseconds
        '2016-05-17T23:30:00,123Z',
        '2016-05-17T23',
        '2016-05-17T23Z',
        '2016-05-17 23',
        '2016-05-17T23:30:00.1234567890Z',
        // offsets without a colon or minutes
        '2016-05-17T23:30:00.000+0200',
        '2016-05-17T23:30:00+02',
        // expanded years, ISO week and ordinal dates, basic format
        '+002016-05-17T23:30:00Z',
        '2016-W20-2',
        '2016-W20',
        '2016-138',
        '20160517',
        '20160517T233000',
        '20160517T233000.5+0200',
        '2016-05',
        '2016',
        // end of day
        '2016-05-17T24:00',
        // out of range units
        '2016-02-30',
        '2016-13-01',
        '2016-05-17T23:30:60',
        '2016-W54-1',
        '2016-367',
        ''
    ],
    null,
    undefined
];

function resourceFor(publishedAt) {
    return {
        id: '5ca5b2b8a7f5e6001ec4e1f0',
        slug: 'short-and-sweet',
        published_at: publishedAt,
        primary_tag: {slug: 'news'},
        primary_author: {slug: 'joe'}
    };
}

describe('utils: replacePermalink() equivalence with 5.3.0', function () {
    let clock;

    beforeEach(function () {
        // moment logs a deprecation warning for non-ISO date strings, and an
        // error for timezones it doesn't know
        sinon.stub(console, 'warn');
        sinon.stub(console, 'error');
        clock = sinon.useFakeTimers(new Date('2016-05-17T23:30:00.000Z'));
    });

    afterEach(function () {
        moment.locale('en');
        clock.restore();
        sinon.restore();
    });

    it('produces identical output for all permalinks, dates and timezones', function () {
        for (const timezone of timezones) {
            for (const publishedAt of publishedAts) {
                const resource = resourceFor(publishedAt);

                for (const permalink of permalinks) {
                    const expected = legacy.replacePermalink(permalink, resource, timezone);
                    const actual = replacePermalink(permalink, resource, timezone);
                    actual.should.equal(expected, `permalink: ${permalink}, published_at: ${publishedAt}, timezone: ${timezone}`);
                }
            }
        }
    });

    it('produces identical output for missing primary tag and author', function () {
        const resource = {id: '1', slug: 'slug', published_at: new Date('2016-05-17T23:30:00.000Z')};

        for (const permalink of permalinks) {
            replacePermalink(permalink, resource, 'Europe/Berlin')
                .should.equal(legacy.replacePermalink(permalink, resource, 'Europe/Berlin'));
        }
    });

    it('produces identical output for unknown timezones', function () {
        const resource = resourceFor(new Date('2016-05-17T23:30:00.000Z'));

        for (const timezone of ['Not/A_Zone', null, '', 'Europe/Berlin ']) {
            replacePermalink('/:year/:month/:day/:slug/', resource, timezone)
                .should.equal(legacy.replacePermalink('/:year/:month/:day/:slug/', resource, timezone));
        }
    });

    it('keeps working after the permalink cache is cleared', function () {
        const resource = resourceFor(new Date('2016-05-17T23:30:00.000Z'));

        for (let i = 0; i < 101; i++) {
            replacePermalink(`/${i}/:year/:slug/`, resource).should.equal(`/${i}/2016/short-and-sweet/`);
        }
    });

    it('keeps working after the formatter cache is cleared', function () {
        const resource = resourceFor(new Date('2016-05-17T23:30:00.000Z'));

        for (let i = 0; i < 101; i++) {
            const timezone = `Etc/GMT${i % 2 ? '+' : '-'}${i % 12}`;
            replacePermalink('/:year/:month/:day/', resource, timezone)
                .should.equal(legacy.replacePermalink('/:year/:month/:day/', resource, timezone));
        }
    });
});

// Behaviour that intentionally changed when moment-timezone was replaced with luxon.
// None of these inputs come from Ghost, which passes Dates and IANA timezone names
describe('utils: replacePermalink() intentional differences from 5.3.0', function () {
    const permalink = '/:year/:month/:day/';

    beforeEach(function () {
        sinon.stub(console, 'warn');
        sinon.stub(console, 'error');
    });

    afterEach(function () {
        moment.locale('en');
        sinon.restore();
    });

    function check(publishedAt, timezone, expected, legacyExpected) {
        const resource = {published_at: publishedAt};
        replacePermalink(permalink, resource, timezone).should.equal(expected);
        legacy.replacePermalink(permalink, resource, timezone).should.equal(legacyExpected);
    }

    it('uses timezones Intl knows but moment did not', function () {
        // legacy abbreviations and SystemV zones
        check(new Date('2016-05-17T20:00:00.000Z'), 'IST', '/2016/05/18/', '/2016/05/17/');
        check(new Date('2016-05-18T03:00:00.000Z'), 'PST', '/2016/05/17/', '/2016/05/18/');
        check(new Date('2016-05-18T03:00:00.000Z'), 'SystemV/PST8', '/2016/05/17/', '/2016/05/18/');
    });

    it('does not treat underscores in timezone names as slashes', function () {
        check(new Date('2016-05-17T23:30:00.000Z'), 'Europe_Berlin', '/2016/05/17/', '/2016/05/18/');
    });

    it('ignores the global moment locale', function () {
        moment.locale('ar');
        check(new Date('2016-05-17T23:30:00.000Z'), 'UTC', '/2016/05/17/', '/٢٠١٦/٠٥/١٧/');
    });

    it('keeps applying daylight saving time after 2499', function () {
        check(new Date('2500-07-01T04:30:00.000Z'), 'America/New_York', '/2500/07/01/', '/2500/06/30/');
    });

    it('parses strings that are not ISO 8601 with Date', function () {
        const invalid = '/Invalid date/Invalid date/Invalid date/';

        // moment allowed leading whitespace in ISO strings
        check(' 2016-05-17T23:30:00Z', 'UTC', invalid, '/2016/05/17/');
        // moment checked RFC 2822 weekdays
        check('Wed, 17 May 2016 23:30:00 GMT', 'UTC', '/2016/05/17/', invalid);
        // luxon accepts a lowercase separator and a basic format time with an extended format date
        check('2016-05-17t23:30:00z', 'UTC', '/2016/05/17/', invalid);
        check('2016-05-17T2330', 'UTC', '/2016/05/17/', invalid);
        // moment allowed whitespace before Z
        check('2016-05-17T23:30:00 Z', 'UTC', invalid, '/2016/05/17/');
        // moment parsed ASP.NET JSON dates
        check('/Date(1463553000000)/', 'UTC', invalid, '/2016/05/18/');
    });

    it('reads a time on its own as today', function () {
        const clock = sinon.useFakeTimers(new Date('2016-05-17T12:00:00.000Z'));

        try {
            check('23:30', 'UTC', '/2016/05/17/', '/Invalid date/Invalid date/Invalid date/');
        } finally {
            clock.restore();
        }
    });

    // Not tested as the results depend on when and where the tests run:
    // - other strings without an offset that Date parses, e.g. 'May 17, 2016 23:30',
    //   are read in the system timezone, moment read them as UTC
    // - wall times within about an hour of a DST gap can land an hour late, as luxon
    //   guesses the offset from the zone's current one, e.g. '1981-03-28T23:00:00' in
    //   America/Nuuk gives 1981-03-29 while Nuuk's current offset differs from both
    //   sides of the gap
});

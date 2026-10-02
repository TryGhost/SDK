// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const sinon = require('sinon');
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
    'europe/berlin'
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
    'May 17, 2016 23:30',
    'not a date',
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
        // moment logs a deprecation warning for non-ISO date strings
        sinon.stub(console, 'warn');
        clock = sinon.useFakeTimers(new Date('2016-05-17T23:30:00.000Z'));
    });

    afterEach(function () {
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

    it('produces identical output for timezones Intl does not support', function () {
        // moment-timezone logs an error for unknown timezones
        sinon.stub(console, 'error');
        const resource = resourceFor(new Date('2016-05-17T23:30:00.000Z'));

        for (const timezone of ['Not/A_Zone', null]) {
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

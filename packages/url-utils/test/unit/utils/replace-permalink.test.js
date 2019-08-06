// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const moment = require('moment-timezone');
const replacePermalink = require('../../../lib/utils/replace-permalink');

describe('utils: replacePermalink()', function () {
    it('permalink is /:slug/, timezone is default', function () {
        const testData = {
            slug: 'short-and-sweet'
        };
        const postLink = '/short-and-sweet/';

        replacePermalink('/:slug/', testData).should.equal(postLink);
    });

    it('permalink is /:year/:month/:day/:slug/, blog timezone is Los Angeles', function () {
        const testData = {
            slug: 'short-and-sweet',
            published_at: new Date('2016-05-18T06:30:00.000Z')
        };
        const timezone = 'America/Los_Angeles';
        const postLink = '/2016/05/17/short-and-sweet/';

        replacePermalink('/:year/:month/:day/:slug/', testData, timezone).should.equal(postLink);
    });

    it('permalink is /:year/:month/:day/:slug/, blog timezone is Asia Tokyo', function () {
        const testData = {
            slug: 'short-and-sweet',
            published_at: new Date('2016-05-18T06:30:00.000Z')
        };
        const timezone = 'Asia/Tokyo';
        const postLink = '/2016/05/18/short-and-sweet/';

        replacePermalink('/:year/:month/:day/:slug/', testData, timezone).should.equal(postLink);
    });

    it('permalink is /:year/:id/:author/, TZ is LA', function () {
        const testData = {
            id: 3,
            primary_author: {slug: 'joe-blog'},
            slug: 'short-and-sweet',
            published_at: new Date('2016-01-01T00:00:00.000Z')
        };
        const timezone = 'America/Los_Angeles';
        const postLink = '/2015/3/joe-blog/';

        replacePermalink('/:year/:id/:author/', testData, timezone).should.equal(postLink);
    });

    it('permalink is /:year/:id:/:author/, TZ is Berlin', function () {
        const testData = {
            id: 3,
            primary_author: {slug: 'joe-blog'},
            slug: 'short-and-sweet',
            published_at: new Date('2016-01-01T00:00:00.000Z')
        };
        const timezone = 'Europe/Berlin';
        const postLink = '/2016/3/joe-blog/';

        replacePermalink('/:year/:id/:author/', testData, timezone).should.equal(postLink);
    });

    it('permalink is /:primary_tag/:slug/ and there is a primary_tag', function () {
        const testData = {
            slug: 'short-and-sweet',
            primary_tag: {slug: 'bitcoin'}
        };
        const timezone = 'Europe/Berlin';
        const postLink = '/bitcoin/short-and-sweet/';

        replacePermalink('/:primary_tag/:slug/', testData, timezone).should.equal(postLink);
    });

    it('permalink is /:primary_tag/:slug/ and there is NO primary_tag', function () {
        const testData = {
            slug: 'short-and-sweet'
        };
        const timezone = 'Europe/Berlin';
        const postLink = '/all/short-and-sweet/';

        replacePermalink('/:primary_tag/:slug/', testData, timezone).should.equal(postLink);
    });

    it('shows "undefined" for unknown route segments', function () {
        const testData = {
            slug: 'short-and-sweet'
        };
        const timezone = 'Europe/Berlin';
        const postLink = '/undefined/short-and-sweet/';

        replacePermalink('/:tag/:slug/', testData, timezone).should.equal(postLink);
    });

    it('post is not published yet', function () {
        const testData = {
            id: 3,
            slug: 'short-and-sweet',
            published_at: null
        };
        const timezone = 'Europe/London';

        const nowMoment = moment().tz('Europe/London');

        let postLink = '/YYYY/MM/DD/short-and-sweet/';

        postLink = postLink.replace('YYYY', nowMoment.format('YYYY'));
        postLink = postLink.replace('MM', nowMoment.format('MM'));
        postLink = postLink.replace('DD', nowMoment.format('DD'));

        replacePermalink('/:year/:month/:day/:slug/', testData, timezone).should.equal(postLink);
    });
});

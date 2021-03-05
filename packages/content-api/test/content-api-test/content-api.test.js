// Switch these lines once there are useful utils
// const testUtils = require('./utils');

const should = require('should');

const GhostContentApi = require('../../cjs/content-api');

describe('GhostContentApi', function () {
    const config = {
        url: 'https://ghost.local',
        version: 'v2',
        key: '0123456789abcdef0123456789'
    };

    describe('new GhostContentApi', function () {
        it('Requires a config object with url, version and key', function () {
            try {
                new GhostContentApi();
                return should.fail();
            } catch (err) {
            //
            }

            try {
                new GhostContentApi({url: config.url, version: config.version});
                return should.fail();
            } catch (err) {
            //
            }

            try {
                new GhostContentApi({version: config.version, key: config.key});
                return should.fail();
            } catch (err) {
            //
            }

            try {
                new GhostContentApi({url: config.url, key: config.key});
                return should.fail();
            } catch (err) {
            //
            }

            new GhostContentApi({host: config.url, key: config.key, version: config.version});
            new GhostContentApi(config);
        });

        it('Returns an "api" object with posts, tags, authors, pages, and settings properties', function () {
            const api = new GhostContentApi(config);

            should.exist(api.posts);
            should.exist(api.tags);
            should.exist(api.authors);
            should.exist(api.pages);
            should.exist(api.settings);
        });
    });
});

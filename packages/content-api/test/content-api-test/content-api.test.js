// Switch these lines once there are useful utils
// const testUtils = require('./utils');

const should = require('should');
const sinon = require('sinon');

const GhostContentApi = require('../../cjs/content-api');
const packageJSON = require('../../package.json');
const packageVersion = packageJSON.version;

describe('GhostContentApi', function () {
    const config = {
        url: 'https://ghost.local',
        version: 'v5.0',
        key: '0123456789abcdef0123456789'
    };

    describe('new GhostContentApi', function () {
        it('Requires a config object with url and key', function () {
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

        it('Returns an "api" object with posts, tags, authors, pages, settings, and tiers properties', function () {
            const api = new GhostContentApi(config);

            should.exist(api.posts);
            should.exist(api.tags);
            should.exist(api.authors);
            should.exist(api.pages);
            should.exist(api.settings);
            should.exist(api.tiers);
            should.exist(api.newsletters);
            should.exist(api.offers);
            should.not.exist(api.settings.read);
            should.not.exist(api.tiers.read);
            should.not.exist(api.newsletters.read);
            should.not.exist(api.offers.browse);
        });
    });

    describe('makeApiRequest', function () {
        it('Can override makeRequest through constructor parameter', async function (){
            const makeRequestStub = sinon.stub().returns(Promise.resolve({
                data: {
                    settings: {}
                }
            }));
            const api = new GhostContentApi({
                url: 'https://ghost.local',
                version: 'v4',
                key: '0123456789abcdef0123456789',
                makeRequest: makeRequestStub
            });

            await api.settings.browse();

            makeRequestStub.calledOnce.should.be.true();
            should.equal(makeRequestStub.args[0][0].params.key, '0123456789abcdef0123456789');
        });

        it('Adds Accept-Version header for v4, v5, canary, and no API versions', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({
                data: {
                    settings: {}
                }
            }));

            const api = new GhostContentApi({
                version: 'canary',
                url: `http://ghost.local`,
                key: '0123456789abcdef0123456789',
                makeRequest: makeRequestStub
            });

            await api.settings.browse();

            makeRequestStub.calledOnce.should.be.true();
            should.equal(makeRequestStub.args[0][0].url, 'http://ghost.local/ghost/api/canary/content/settings/');
            should.equal(makeRequestStub.args[0][0].headers['Accept-Version'], 'v5.0');
            should.equal(makeRequestStub.args[0][0].headers['User-Agent'], `GhostContentSDK/${packageVersion}`);
        });

        it('Adds "v5" Accept-Version header when parameter is provided', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({
                data: {
                    settings: {}
                }
            }));

            const api = new GhostContentApi({
                version: 'v5.0',
                url: `http://ghost.local`,
                key: '0123456789abcdef0123456789',
                makeRequest: makeRequestStub
            });

            await api.settings.browse();

            makeRequestStub.calledOnce.should.be.true();
            should.equal(makeRequestStub.args[0][0].url, 'http://ghost.local/ghost/api/content/settings/');
            should.equal(makeRequestStub.args[0][0].headers['Accept-Version'], 'v5.0');
            should.equal(makeRequestStub.args[0][0].headers['User-Agent'], `GhostContentSDK/${packageVersion}`);
        });

        it('Adds Accept-Version header for v3 API', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({
                data: {
                    settings: {}
                }
            }));

            const api = new GhostContentApi({
                version: 'v3',
                url: `http://ghost.local`,
                key: '0123456789abcdef0123456789',
                makeRequest: makeRequestStub
            });

            await api.settings.browse();

            makeRequestStub.calledOnce.should.be.true();
            should.equal(makeRequestStub.args[0][0].url, 'http://ghost.local/ghost/api/v3/content/settings/');
            should.equal(makeRequestStub.args[0][0].headers['Accept-Version'], 'v3.0');
            should.equal(makeRequestStub.args[0][0].headers['User-Agent'], `GhostContentSDK/${packageVersion}`);
        });

        it('Adds Accept-Version header for version v3.6', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({
                data: {
                    settings: {}
                }
            }));

            const api = new GhostContentApi({
                version: 'v3.6',
                url: `http://ghost.local`,
                key: '0123456789abcdef0123456789',
                makeRequest: makeRequestStub
            });

            await api.settings.browse();

            makeRequestStub.calledOnce.should.be.true();
            should.equal(makeRequestStub.args[0][0].url, 'http://ghost.local/ghost/api/v3/content/settings/');
            should.equal(makeRequestStub.args[0][0].headers['Accept-Version'], 'v3.6');
            should.equal(makeRequestStub.args[0][0].headers['User-Agent'], `GhostContentSDK/${packageVersion}`);
        });

        it('Does NOT add Accept-Version when version set to "false"', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({
                data: {
                    settings: {}
                }
            }));

            const api = new GhostContentApi({
                version: false,
                url: `http://ghost.local`,
                key: '0123456789abcdef0123456789',
                makeRequest: makeRequestStub
            });

            await api.settings.browse();

            makeRequestStub.calledOnce.should.be.true();
            should.equal(makeRequestStub.args[0][0].url, 'http://ghost.local/ghost/api/content/settings/');
            should.equal(makeRequestStub.args[0][0].headers['Accept-Version'], undefined);
            should.equal(makeRequestStub.args[0][0].headers['User-Agent'], `GhostContentSDK/${packageVersion}`);
        });

        it('Adds default Accept-Version when version set to "true"', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({
                data: {
                    settings: {}
                }
            }));

            const api = new GhostContentApi({
                version: true,
                url: `http://ghost.local`,
                key: '0123456789abcdef0123456789',
                makeRequest: makeRequestStub
            });

            await api.settings.browse();

            makeRequestStub.calledOnce.should.be.true();
            should.equal(makeRequestStub.args[0][0].headers['Accept-Version'], 'v5.0');
            should.equal(makeRequestStub.args[0][0].headers['User-Agent'], `GhostContentSDK/${packageVersion}`);
        });
    });
});

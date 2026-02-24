const assert = require('assert/strict');
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

        it('Throws for unsupported version format', function () {
            assert.throws(() => {
                new GhostContentApi({url: 'https://ghost.local', version: 'bad', key: '0123456789abcdef0123456789'});
            }, /Config Invalid: 'version' bad is not supported/);
        });

        it('Throws when url lacks a protocol', function () {
            assert.throws(() => {
                new GhostContentApi({url: 'ghost.local', version: 'v5.0', key: '0123456789abcdef0123456789'});
            }, /Config Invalid: 'url' ghost\.local requires a protocol/);
        });

        it('Throws when url has a trailing slash', function () {
            assert.throws(() => {
                new GhostContentApi({url: 'https://ghost.local/', version: 'v5.0', key: '0123456789abcdef0123456789'});
            }, /Config Invalid: 'url' .* must not have a trailing slash/);
        });

        it('Throws when ghostPath has a leading or trailing slash', function () {
            assert.throws(() => {
                new GhostContentApi({url: 'https://ghost.local', version: 'v5.0', key: '0123456789abcdef0123456789', ghostPath: '/ghost'});
            }, /Config Invalid: 'ghostPath' .* must not have a leading or trailing slash/);
        });

        it('Throws when key has an invalid format', function () {
            assert.throws(() => {
                new GhostContentApi({url: 'https://ghost.local', version: 'v5.0', key: 'invalid-key'});
            }, /Config Invalid: 'key' invalid-key must have 26 hex characters/);
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
            should.equal(makeRequestStub.args[0][0].headers['Accept-Version'], 'v6.0');
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
            should.equal(makeRequestStub.args[0][0].headers['Accept-Version'], 'v6.0');
            should.equal(makeRequestStub.args[0][0].headers['User-Agent'], `GhostContentSDK/${packageVersion}`);
        });

        it('Removes User-Agent header when set to "false"', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({
                data: {
                    settings: {}
                }
            }));

            const api = new GhostContentApi({
                version: 'canary',
                url: `http://ghost.local`,
                key: '0123456789abcdef0123456789',
                makeRequest: makeRequestStub,
                userAgent: false
            });

            await api.settings.browse();

            makeRequestStub.calledOnce.should.be.true();
            should.equal(makeRequestStub.args[0][0].url, 'http://ghost.local/ghost/api/canary/content/settings/');
            should.equal(makeRequestStub.args[0][0].headers['Accept-Version'], 'v6.0');
            should.equal(makeRequestStub.args[0][0].headers['User-Agent'], undefined);
        });

        it('Sets a custom User-Agent header', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({
                data: {
                    settings: {}
                }
            }));

            const api = new GhostContentApi({
                version: 'canary',
                url: `http://ghost.local`,
                key: '0123456789abcdef0123456789',
                makeRequest: makeRequestStub,
                userAgent: 'I_LOVE_CUSTOM_THINGS'
            });

            await api.settings.browse();

            makeRequestStub.calledOnce.should.be.true();
            should.equal(makeRequestStub.args[0][0].url, 'http://ghost.local/ghost/api/canary/content/settings/');
            should.equal(makeRequestStub.args[0][0].headers['Accept-Version'], 'v6.0');
            should.equal(makeRequestStub.args[0][0].headers['User-Agent'], 'I_LOVE_CUSTOM_THINGS');
        });

        it('Rejects with missing key error when no key and no membersToken are provided', async function () {
            const api = new GhostContentApi({
                version: 'v5.0',
                url: 'https://ghost.local',
                makeRequest: sinon.stub()
            });

            await assert.rejects(
                api.posts.browse(),
                (err) => {
                    assert.equal(err.message, '@tryghost/content-api Config Missing: \'key\' is required.');
                    return true;
                }
            );
        });

        it('Rethrows errors that do not have a response with error details', async function () {
            const networkError = new Error('Network failure');
            const makeRequestStub = sinon.stub().rejects(networkError);

            const api = new GhostContentApi({
                version: 'v5.0',
                url: 'https://ghost.local',
                key: '0123456789abcdef0123456789',
                makeRequest: makeRequestStub
            });

            await assert.rejects(
                api.posts.browse(),
                (err) => {
                    assert.equal(err, networkError);
                    assert.equal(err.message, 'Network failure');
                    return true;
                }
            );
        });
    });
});

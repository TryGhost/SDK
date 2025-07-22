// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../utils');
const should = require('should');

const GhostAdminAPI = require('../../lib/admin-api');
const packageJSON = require('../../package.json');
const packageVersion = packageJSON.version;

describe('GhostAdminAPI general', function () {
    const config = {
        version: 'v5',
        url: `http://ghost.local`,
        key: '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0'
    };

    it('Requires a config object with url and key', function () {
        should.throws(
            () => new GhostAdminAPI(),
            Error,
            'Missing config object'
        );
        should.throws(
            () => new GhostAdminAPI({url: config.url, version: config.version}),
            Error,
            'Missing config.key property'
        );

        should.throws(
            () => new GhostAdminAPI({version: config.version, key: config.key}),
            Error,
            'Missing config.url property'
        );

        should.doesNotThrow(
            () => new GhostAdminAPI({url: config.url, key: config.key}),
            'Version is now optional'
        );

        should.doesNotThrow(
            () => new GhostAdminAPI({url: config.url, version: config.version, key: config.key}),
            Error,
            'Correct config properties'
        );
        should.doesNotThrow(
            () => new GhostAdminAPI(config),
            Error,
            'Correct config object'
        );
    });

    it('Requires correct key format in config object', function () {
        should.throws(
            () => new GhostAdminAPI({key: 'badkey', url: config.url, version: config.version}),
            Error,
            'Invalid config.key property'
        );
    });

    it('Allows makeRequest override', function () {
        const makeRequest = () => {
            return Promise.resolve({
                config: {
                    test: true
                }
            });
        };
        const api = new GhostAdminAPI(Object.assign({}, config, {makeRequest}));

        return api.config.read().then((data) => {
            should.deepEqual(data, {test: true});
        });
    });

    it('Exposes a v4 API', function () {
        const api = new GhostAdminAPI(config);
        const keyMethodMap = {
            posts: ['read', 'browse', 'add', 'edit', 'delete'],
            pages: ['read', 'browse', 'add', 'edit', 'delete'],
            tags: ['read', 'browse', 'add', 'edit', 'delete'],
            members: ['read', 'browse', 'add', 'edit', 'delete'],
            newsletters: ['read', 'browse', 'add', 'edit', 'delete'],
            users: ['read', 'browse', 'add', 'edit', 'delete'],
            webhooks: ['add', 'edit', 'delete'],
            themes: ['upload', 'activate'],
            images: ['upload'],
            media: ['upload'],
            files: ['upload'],
            config: ['read'],
            site: ['read']
        };

        should.deepEqual(Object.keys(keyMethodMap).sort(), Object.keys(api).sort());
        for (const key in keyMethodMap) {
            should.deepEqual(Object.keys(api[key]), keyMethodMap[key]);
        }
    });

    it('Exposes a v2 API', function () {
        const v3Config = {
            version: 'v2',
            url: `http://ghost.local`,
            key: '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0'
        };
        const api = new GhostAdminAPI(v3Config);
        const keyMethodMap = {
            posts: ['read', 'browse', 'add', 'edit', 'delete'],
            pages: ['read', 'browse', 'add', 'edit', 'delete'],
            tags: ['read', 'browse', 'add', 'edit', 'delete'],
            members: ['read', 'browse', 'add', 'edit', 'delete'],
            newsletters: ['read', 'browse', 'add', 'edit', 'delete'],
            users: ['read', 'browse', 'add', 'edit', 'delete'],
            webhooks: ['add', 'edit', 'delete'],
            themes: ['upload', 'activate'],
            images: ['upload'],
            media: ['upload'],
            files: ['upload'],
            config: ['read'],
            site: ['read'],
            subscribers: ['read', 'browse', 'add', 'edit', 'delete']
        };

        should.deepEqual(Object.keys(keyMethodMap).sort(), Object.keys(api).sort());
        for (const key in keyMethodMap) {
            should.deepEqual(Object.keys(api[key]), keyMethodMap[key]);
        }
    });

    describe('makeApiRequest', function () {
        it('adds Accept-Version headers for v5 API', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({
                config: {}
            }));
            const generateTokenSpy = sinon.spy();

            const api = new GhostAdminAPI({
                version: 'v5',
                url: `http://ghost.local`,
                key: '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0',
                makeRequest: makeRequestStub,
                generateToken: generateTokenSpy
            });

            await api.config.read();

            makeRequestStub.calledOnce.should.be.true();
            should.equal(makeRequestStub.args[0][0].headers['Accept-Version'], 'v5.0');
            should.equal(makeRequestStub.args[0][0].headers['User-Agent'], `GhostAdminSDK/${packageVersion}`);
            should.equal(generateTokenSpy.calledOnce, true);
            should.equal(generateTokenSpy.args[0][0], '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0');
            should.equal(generateTokenSpy.args[0][1], '/admin/');
        });

        it('adds Accept-Version header for v5.3 version', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({
                config: {}
            }));
            const generateTokenSpy = sinon.spy();

            const api = new GhostAdminAPI({
                version: 'v5.3',
                url: `http://ghost.local`,
                key: '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0',
                makeRequest: makeRequestStub,
                generateToken: generateTokenSpy
            });

            await api.config.read();

            makeRequestStub.calledOnce.should.be.true();
            should.equal(makeRequestStub.args[0][0].headers['Accept-Version'], 'v5.3');
            should.equal(makeRequestStub.args[0][0].headers['User-Agent'], `GhostAdminSDK/${packageVersion}`);
            should.equal(generateTokenSpy.calledOnce, true);
            should.equal(generateTokenSpy.args[0][0], '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0');
            should.equal(generateTokenSpy.args[0][1], '/admin/');
        });

        it('adds Accept-Version header for v3 API', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({
                config: {}
            }));
            const generateTokenSpy = sinon.spy();

            const api = new GhostAdminAPI({
                version: 'v3',
                url: `http://ghost.local`,
                key: '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0',
                makeRequest: makeRequestStub,
                generateToken: generateTokenSpy
            });

            await api.config.read();

            makeRequestStub.calledOnce.should.be.true();
            should.equal(makeRequestStub.args[0][0].headers['Accept-Version'], 'v3.0');
            should.equal(makeRequestStub.args[0][0].headers['User-Agent'], `GhostAdminSDK/${packageVersion}`);
            should.equal(generateTokenSpy.args[0][0], '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0');
            should.equal(generateTokenSpy.args[0][1], '/v3/admin/');
        });

        it('adds Accept-Version header for v4.5', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({
                config: {}
            }));
            const generateTokenSpy = sinon.spy();

            const api = new GhostAdminAPI({
                version: 'v4.5',
                url: `http://ghost.local`,
                key: '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0',
                makeRequest: makeRequestStub,
                generateToken: generateTokenSpy
            });

            await api.config.read();

            makeRequestStub.calledOnce.should.be.true();
            should.equal(makeRequestStub.args[0][0].headers['Accept-Version'], 'v4.5');
            should.equal(makeRequestStub.args[0][0].headers['User-Agent'], `GhostAdminSDK/${packageVersion}`);
            should.equal(generateTokenSpy.args[0][0], '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0');
            should.equal(generateTokenSpy.args[0][1], '/v4/admin/');
        });

        it('adds Accept-Version header for canary API', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({
                config: {}
            }));
            const generateTokenSpy = sinon.spy();

            const api = new GhostAdminAPI({
                version: 'canary',
                url: `http://ghost.local`,
                key: '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0',
                makeRequest: makeRequestStub,
                generateToken: generateTokenSpy
            });

            await api.config.read();

            makeRequestStub.calledOnce.should.be.true();
            should.equal(makeRequestStub.args[0][0].headers['Accept-Version'], 'v6.0');
            should.equal(makeRequestStub.args[0][0].headers['User-Agent'], `GhostAdminSDK/${packageVersion}`);
            should.equal(generateTokenSpy.args[0][0], '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0');
            should.equal(generateTokenSpy.args[0][1], '/canary/admin/');
        });

        it('when version parameter is set to "false" should not send "Accept-Version" header', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({
                config: {}
            }));
            const generateTokenSpy = sinon.spy();

            const api = new GhostAdminAPI({
                version: false,
                url: `http://ghost.local`,
                key: '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0',
                makeRequest: makeRequestStub,
                generateToken: generateTokenSpy
            });

            await api.config.read();

            makeRequestStub.calledOnce.should.be.true();
            should.equal(makeRequestStub.args[0][0].headers['Accept-Version'], undefined);
            should.equal(makeRequestStub.args[0][0].headers['User-Agent'], `GhostAdminSDK/${packageVersion}`);
            should.equal(generateTokenSpy.args[0][0], '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0');
            should.equal(generateTokenSpy.args[0][1], '/admin/');
        });

        it('when version parameter is set to "true" should send a default "Accept-Version" header', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({
                config: {}
            }));
            const generateTokenSpy = sinon.spy();

            const api = new GhostAdminAPI({
                version: true,
                url: `http://ghost.local`,
                key: '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0',
                makeRequest: makeRequestStub,
                generateToken: generateTokenSpy
            });

            await api.config.read();

            makeRequestStub.calledOnce.should.be.true();
            should.equal(makeRequestStub.args[0][0].headers['Accept-Version'], 'v6.0');
            should.equal(makeRequestStub.args[0][0].headers['User-Agent'], `GhostAdminSDK/${packageVersion}`);
            should.equal(generateTokenSpy.args[0][0], '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0');
            should.equal(generateTokenSpy.args[0][1], '/admin/');
        });

        it('does not set "User-Agent" header when disabled', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({
                config: {}
            }));
            const generateTokenSpy = sinon.spy();

            const api = new GhostAdminAPI({
                version: true,
                url: `http://ghost.local`,
                key: '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0',
                makeRequest: makeRequestStub,
                generateToken: generateTokenSpy,
                userAgent: false
            });

            await api.config.read();

            makeRequestStub.calledOnce.should.be.true();
            should.equal(makeRequestStub.args[0][0].headers['Accept-Version'], 'v6.0');
            should.equal(makeRequestStub.args[0][0].headers['User-Agent'], undefined);
            should.equal(generateTokenSpy.args[0][0], '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0');
            should.equal(generateTokenSpy.args[0][1], '/admin/');
        });

        it('sets a custom value for "User-Agent" header', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({
                config: {}
            }));
            const generateTokenSpy = sinon.spy();

            const api = new GhostAdminAPI({
                version: true,
                url: `http://ghost.local`,
                key: '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0',
                makeRequest: makeRequestStub,
                generateToken: generateTokenSpy,
                userAgent: 'Custom Value'
            });

            await api.config.read();

            makeRequestStub.calledOnce.should.be.true();
            should.equal(makeRequestStub.args[0][0].headers['Accept-Version'], 'v6.0');
            should.equal(makeRequestStub.args[0][0].headers['User-Agent'], 'Custom Value');
            should.equal(generateTokenSpy.args[0][0], '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0');
            should.equal(generateTokenSpy.args[0][1], '/admin/');
        });

        it('throws error when v6 is specified as version', function () {
            should.throws(
                () => new GhostAdminAPI({
                    version: 'v6',
                    url: `http://ghost.local`,
                    key: '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0'
                }),
                Error,
                `Did not error for unsupported 'v6' version`
            );
        });

        it('handles optional version parameter and uses /admin/ path by default', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({
                config: {}
            }));
            const generateTokenSpy = sinon.spy();

            const api = new GhostAdminAPI({
                url: `http://ghost.local`,
                key: '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0',
                makeRequest: makeRequestStub,
                generateToken: generateTokenSpy
            });

            await api.config.read();

            makeRequestStub.calledOnce.should.be.true();
            should.equal(makeRequestStub.args[0][0].headers['Accept-Version'], undefined);
            should.equal(generateTokenSpy.args[0][0], '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0');
            should.equal(generateTokenSpy.args[0][1], '/admin/');
        });
    });
});

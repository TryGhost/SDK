// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../utils');
const should = require('should');

const GhostAdminAPI = require('../../lib');

describe('GhostAdminAPI general', function () {
    const config = {
        version: 'v4',
        url: `http://ghost.local`,
        key: '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0'
    };

    it('Requires a config object with host, version and key', function () {
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

        should.throws(
            () => new GhostAdminAPI({url: config.url, key: config.key}),
            Error,
            'Missing config.version property'
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

    it('Exposes an API', function () {
        const api = new GhostAdminAPI(config);
        const keyMethodMap = {
            posts: ['read', 'browse', 'add', 'edit', 'delete'],
            pages: ['read', 'browse', 'add', 'edit', 'delete'],
            tags: ['read', 'browse', 'add', 'edit', 'delete'],
            members: ['read', 'browse', 'add', 'edit', 'delete'],
            users: ['read', 'browse', 'add', 'edit', 'delete'],
            webhooks: ['add', 'edit', 'delete'],
            themes: ['upload', 'activate'],
            images: ['upload'],
            media: ['upload'],
            files: ['upload'],
            config: ['read'],
            site: ['read']
        };

        for (const key in keyMethodMap) {
            should.deepEqual(Object.keys(api[key]), keyMethodMap[key]);
        }
    });

    describe('makeApiRequest', function () {
        it('adds Accept-Version header for v5 API', async function () {
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
            should.equal(generateTokenSpy.args[0][0], '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0');
            should.equal(generateTokenSpy.args[0][1], '/v3/admin/');
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
            should.equal(makeRequestStub.args[0][0].headers['Accept-Version'], 'v4.0');
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
            should.equal(generateTokenSpy.args[0][0], '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0');
            should.equal(generateTokenSpy.args[0][1], '/admin/');
        });
    });
});

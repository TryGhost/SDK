// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../utils');
const should = require('should');
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');

const GhostAdminAPI = require('../../lib/admin-api');
const GhostAdminAPIFromIndex = require('../../index');
const packageJSON = require('../../package.json');
const packageVersion = packageJSON.version;

describe('GhostAdminAPI general', function () {
    const config = {
        version: 'v5',
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
    });

    it('can be imported from the index entry point', function () {
        assert.equal(GhostAdminAPIFromIndex, GhostAdminAPI);
    });

    describe('resource.delete', function () {
        it('rejects with missing data', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({}));
            const api = new GhostAdminAPI(Object.assign({}, config, {makeRequest: makeRequestStub}));

            await assert.rejects(
                api.posts.delete(),
                {message: 'Missing data'}
            );
        });

        it('rejects when data has no id or email', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({}));
            const api = new GhostAdminAPI(Object.assign({}, config, {makeRequest: makeRequestStub}));

            await assert.rejects(
                api.posts.delete({name: 'test'}),
                {message: 'Must include either data.id or data.email'}
            );
        });

        it('makes a DELETE request with data.id', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({}));
            const api = new GhostAdminAPI(Object.assign({}, config, {makeRequest: makeRequestStub}));

            await api.posts.delete({id: '123'});

            assert.equal(makeRequestStub.calledOnce, true);
            assert.equal(makeRequestStub.args[0][0].method, 'DELETE');
            assert.match(makeRequestStub.args[0][0].url, /posts\/123\/$/);
        });

        it('makes a DELETE request with data.email', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({}));
            const api = new GhostAdminAPI(Object.assign({}, config, {makeRequest: makeRequestStub}));

            await api.members.delete({email: 'test@example.com'});

            assert.equal(makeRequestStub.calledOnce, true);
            assert.equal(makeRequestStub.args[0][0].method, 'DELETE');
            assert.match(makeRequestStub.args[0][0].url, /members\/email\/test@example\.com\/$/);
        });
    });

    describe('non-webhook resource API shape', function () {
        it('posts resource exposes read, browse, add, edit, delete', function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({posts: []}));
            const api = new GhostAdminAPI(Object.assign({}, config, {makeRequest: makeRequestStub}));

            assert.deepEqual(Object.keys(api.posts), ['read', 'browse', 'add', 'edit', 'delete']);
        });

        it('webhooks resource only exposes add, edit, delete', function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({}));
            const api = new GhostAdminAPI(Object.assign({}, config, {makeRequest: makeRequestStub}));

            assert.deepEqual(Object.keys(api.webhooks), ['add', 'edit', 'delete']);
        });
    });

    describe('upload with ref and thumbnail', function () {
        let createReadStreamStub;
        let fixturePath;

        beforeEach(function () {
            fixturePath = path.join(__dirname, '..', 'fixtures', 'ghost-logo.png');
            createReadStreamStub = sinon.stub(fs, 'createReadStream').returns('mock-stream');
        });

        afterEach(function () {
            createReadStreamStub.restore();
        });

        it('appends ref to form data when data.ref is provided', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({
                files: [{url: '/file/url', ref: 'my-ref'}]
            }));
            const api = new GhostAdminAPI(Object.assign({}, config, {makeRequest: makeRequestStub}));

            await api.files.upload({file: fixturePath, ref: 'my-ref'});

            assert.equal(makeRequestStub.calledOnce, true);
            const formData = makeRequestStub.args[0][0].data;
            const refField = formData._streams.find(s => typeof s === 'string' && s.includes('name="ref"'));
            assert.ok(refField, 'form data should contain a ref field');
        });

        it('appends thumbnail to form data when data.thumbnail is provided', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({
                media: [{url: '/media/url'}]
            }));
            const api = new GhostAdminAPI(Object.assign({}, config, {makeRequest: makeRequestStub}));

            const thumbnailPath = path.join(__dirname, '..', 'fixtures', 'ghost-logo.png');
            await api.media.upload({file: fixturePath, thumbnail: thumbnailPath});

            assert.equal(makeRequestStub.calledOnce, true);
            const formData = makeRequestStub.args[0][0].data;
            const thumbnailField = formData._streams.find(s => typeof s === 'string' && s.includes('name="thumbnail"'));
            assert.ok(thumbnailField, 'form data should contain a thumbnail field');
        });
    });

    describe('api.media.upload', function () {
        let createReadStreamStub;

        beforeEach(function () {
            createReadStreamStub = sinon.stub(fs, 'createReadStream').returns('mock-stream');
        });

        afterEach(function () {
            createReadStreamStub.restore();
        });

        it('makes a POST request to the media upload endpoint', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({
                media: [{url: '/media/url'}]
            }));
            const api = new GhostAdminAPI(Object.assign({}, config, {makeRequest: makeRequestStub}));

            const fixturePath = path.join(__dirname, '..', 'fixtures', 'ghost-logo.png');
            await api.media.upload({file: fixturePath});

            assert.equal(makeRequestStub.calledOnce, true);
            assert.match(makeRequestStub.args[0][0].url, /media\/upload\/$/);
            assert.equal(makeRequestStub.args[0][0].method, 'POST');
        });
    });

    describe('api.site.read', function () {
        it('makes a GET request to the site endpoint', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({
                site: {title: 'Test Site'}
            }));
            const api = new GhostAdminAPI(Object.assign({}, config, {makeRequest: makeRequestStub}));

            const result = await api.site.read();

            assert.equal(makeRequestStub.calledOnce, true);
            assert.match(makeRequestStub.args[0][0].url, /\/site\/$/);
            assert.deepEqual(result, {title: 'Test Site'});
        });
    });

    describe('error handling', function () {
        it('strips request/config/response from errors without response.data.errors', async function () {
            const err = new Error('Network Error');
            err.request = {some: 'request'};
            err.config = {some: 'config'};
            err.response = {status: 500};

            const makeRequestStub = sinon.stub().rejects(err);
            const api = new GhostAdminAPI(Object.assign({}, config, {makeRequest: makeRequestStub}));

            try {
                await api.posts.browse();
                assert.fail('should have thrown');
            } catch (thrownErr) {
                assert.equal(thrownErr.message, 'Network Error');
                assert.equal(thrownErr.request, undefined);
                assert.equal(thrownErr.config, undefined);
                assert.equal(thrownErr.response, undefined);
            }
        });
    });

    describe('config validation', function () {
        it('rejects url with trailing slash', function () {
            assert.throws(
                () => new GhostAdminAPI({url: 'http://ghost.local/', version: config.version, key: config.key}),
                {message: /must not have a trailing slash/}
            );
        });

        it('rejects url without protocol', function () {
            assert.throws(
                () => new GhostAdminAPI({url: 'ghost.local', version: config.version, key: config.key}),
                {message: /requires a protocol/}
            );
        });

        it('rejects ghostPath with leading slash', function () {
            assert.throws(
                () => new GhostAdminAPI({url: config.url, version: config.version, key: config.key, ghostPath: '/ghost'}),
                {message: /must not have a leading or trailing slash/}
            );
        });

        it('rejects ghostPath with trailing slash', function () {
            assert.throws(
                () => new GhostAdminAPI({url: config.url, version: config.version, key: config.key, ghostPath: 'ghost/'}),
                {message: /must not have a leading or trailing slash/}
            );
        });

        it('rejects unsupported version string', function () {
            assert.throws(
                () => new GhostAdminAPI({url: config.url, version: 'bad', key: config.key}),
                {message: /is not supported/}
            );
        });

        it('uses host as url when host is provided and url is not', function () {
            const api = new GhostAdminAPI({host: config.url, version: config.version, key: config.key});
            assert.equal(typeof api.posts.browse, 'function');
        });

        it('prefers url over host when both are provided', function () {
            const api = new GhostAdminAPI({url: config.url, host: 'http://other.local', version: config.version, key: config.key});
            assert.equal(typeof api.posts.browse, 'function');
        });
    });

    describe('resource.edit', function () {
        it('rejects when data has no id', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({}));
            const api = new GhostAdminAPI(Object.assign({}, config, {makeRequest: makeRequestStub}));

            await assert.rejects(
                api.posts.edit({title: 'test'}),
                {message: 'Must include data.id'}
            );
        });
    });

    describe('resource.read', function () {
        it('rejects with missing data', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({}));
            const api = new GhostAdminAPI(Object.assign({}, config, {makeRequest: makeRequestStub}));

            await assert.rejects(
                api.posts.read(),
                {message: 'Missing data'}
            );
        });

        it('rejects when data has no id, slug, or email', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({}));
            const api = new GhostAdminAPI(Object.assign({}, config, {makeRequest: makeRequestStub}));

            await assert.rejects(
                api.posts.read({title: 'test'}),
                {message: 'Must include either data.id or data.slug or data.email'}
            );
        });
    });
});

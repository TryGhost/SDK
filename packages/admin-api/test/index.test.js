// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('./utils');

const assert = require('assert');
const {createServer} = require('http');

const jwt = require('jsonwebtoken');

const GhostAdminAPI = require('../index');
const applicationId = 'mmm';
const applicationSecret = 'bad455';
const applicationKey = `${applicationId}:${applicationSecret}`;

describe('GhostAdminAPI', function () {
    let server;
    let apiHost;

    before(function (done) {
        server = createServer();
        server.on('listening', () => {
            const address = server.address();
            apiHost = `http://${address.address}:${address.port}`;
            done();
        });
        server.listen({host: '127.0.0.1', port: 0});
    });

    afterEach(function () {
        server.listeners('request').forEach(
            listener => server.removeListener('request', listener)
        );
    });

    after(function (done) {
        server.close(done);
    });

    it('exports a create method', function () {
        assert.equal(typeof GhostAdminAPI.create, 'function');
    });

    describe('#create({apiHost, applicationKey})', function () {
        it('returns a function', function () {
            assert.equal(typeof GhostAdminAPI.create({apiHost, applicationKey}), 'function');
        });

        it('makes a request to apiHost/path', function (done) {
            server.on('request', (req, res) => {
                res.end();
                assert.equal(req.url, '/whatever');
                done();
            });
            const api = GhostAdminAPI.create({apiHost, applicationKey});

            api('/whatever');
        });

        it('sends a json Accept header', function (done) {
            server.on('request', (req, res) => {
                res.end();
                assert.equal(req.headers.accept, 'application/json');
                done();
            });
            const api = GhostAdminAPI.create({apiHost, applicationKey});

            api('/whatever');
        });

        it('sends a json Content-Type header', function (done) {
            server.on('request', (req, res) => {
                res.end();
                assert.equal(req.headers['content-type'], 'application/json');
                done();
            });
            const api = GhostAdminAPI.create({apiHost, applicationKey});

            api('/whatever');
        });

        it('sends an Authorization header with Ghost scheme', function (done) {
            server.on('request', (req, res) => {
                res.end();
                assert.ok(/^Ghost:\s/.test(req.headers.authorization));
                done();
            });
            const api = GhostAdminAPI.create({apiHost, applicationKey});

            api('/whatever');
        });

        it('sends an Authorization header with valid jwt', function (done) {
            server.on('request', (req, res) => {
                res.end();
                const token = req.headers.authorization.split('Ghost: ')[1];
                try {
                    jwt.verify(token, Buffer.from(applicationSecret, 'hex'), {
                        algorithms: ['HS256'],
                        maxAge: '5m',
                        issuer: applicationId,
                        audience: '/whatever'
                    });
                } catch (e) {
                    assert.fail(e);
                } finally {
                    done();
                }
            });
            const api = GhostAdminAPI.create({apiHost, applicationKey});

            api('/whatever');
        });
    });
});

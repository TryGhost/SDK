// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../utils');
const should = require('should');
const http = require('http');
const url = require('url');

const GhostAdminAPI = require('../../lib');

describe('GhostAdminAPI general', function () {
    const config = {
        version: 'v2',
        key: '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0'
    };
    let server, returnError;

    beforeEach(function () {
        returnError = false;
    });

    before(function (done) {
        server = http.createServer();
        server.on('listening', () => {
            const {address, port} = server.address();
            config.url = `http://${address}:${port}`;
            // config.url = `http://ghost.local`;
            done();
        });

        server.on('request', (req, res) => {
            const parsedUrl = url.parse(req.url, true);
            server.emit('method', req.method);
            server.emit('url', parsedUrl);
            server.emit('headers', req.headers);

            if (returnError) {
                res.writeHead(422, {
                    'Content-Type': 'application/json'
                });

                res.end(JSON.stringify({
                    errors: [{
                        message: 'this is an error',
                        context: 'this is my context',
                        type: 'ValidationError',
                        details: {},
                        help: 'docs link',
                        code: 'ERROR',
                        id: 'id'
                    }]
                }));

                return;
            }

            res.writeHead(200, {
                'Content-Type': 'application/json'
            });

            let data;

            const browseMatch = parsedUrl.pathname.match(/\/([a-z]+)\/$/);
            if (browseMatch) {
                data = {
                    [browseMatch[1]]: [{}, {}, {}],
                    meta: {}
                };
            }

            const idMatch = parsedUrl.pathname.match(/\/([a-z]+)\/([0-9a-f]+)\/$/);
            const slugMatch = parsedUrl.pathname.match(/\/([a-z]+)\/slug\/([\w]+)\/$/);

            const identifierMatch = idMatch || slugMatch;
            if (identifierMatch) {
                const type = idMatch ? 'id' : 'slug';
                data = {
                    [identifierMatch[1]]: [{
                        [type]: identifierMatch[2]
                    }]
                };
            }

            const configMatch = parsedUrl.pathname.match(/\/configuration(?:\/about)?\/$/);
            if (configMatch) {
                data = {
                    configuration: [{version: '2.13.2'}]
                };
            }

            if (req.headers['content-type'].match(/multipart/)) {
                data = {
                    images: [{
                        url: `${config.url}/image/url`,
                        ref: null
                    }]
                };
            } else if (parsedUrl.pathname.match(/theme\/activate/)) {
                data = {
                    themes: []
                };
            } else if (req.method === 'POST') {
                data = {
                    [browseMatch[1]]: [{
                        slug: 'new-resource'
                    }]
                };
            } else if (req.method === 'PUT') {
                const type = idMatch ? 'id' : 'slug';
                data = {
                    [identifierMatch[1]]: [{
                        [type]: identifierMatch[2],
                        slug: 'edited-resource'
                    }]
                };
            } else if (req.method === 'DELETE') {
                data = null;
            }

            res.end(JSON.stringify(data));
        });
        server.listen(0, '127.0.0.1');
    });

    after(function () {
        server.close();
    });

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

    describe('api.webhooks API', function () {
        it('webhook exposes only add, delete, and edit methods', function () {
            const api = new GhostAdminAPI(config);
            should.deepEqual(Object.keys(api.webhooks), ['add', 'edit', 'delete']);
        });
    });
});

// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../utils');
const should = require('should');
const http = require('http');
const url = require('url');

const GhostAdminAPI = require('../../lib');

describe('GhostAdminAPI v4', function () {
    const API_VERSION = 'v4';
    const config = {
        version: API_VERSION,
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

            res.end(JSON.stringify(data));
        });
        server.listen(0, '127.0.0.1');
    });

    after(function () {
        server.close();
    });

    it('works', function (done) {
        const api = new GhostAdminAPI(config);

        server.once('url', ({pathname}) => {
            should.equal(pathname, `/ghost/api/v4/admin/posts/`);
            done();
        });

        api.posts.browse();
    });
});

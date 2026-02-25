const assert = require('assert/strict');
const http = require('http');
const GhostContentAPI = require('../../cjs/content-api');
const packageJSON = require('../../package.json');

const packageVersion = packageJSON.version;

describe('GhostContentAPI Integration (real HTTP)', function () {
    const API_KEY = '0123456789abcdef0123456789';

    let server;
    let serverUrl;
    let lastRequest;
    let serverBehavior;

    before(function (done) {
        server = http.createServer((req, res) => {
            const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

            lastRequest = {
                method: req.method,
                url: req.url,
                pathname: parsedUrl.pathname,
                query: Object.fromEntries(parsedUrl.searchParams),
                headers: req.headers
            };

            if (serverBehavior === 'error') {
                res.writeHead(404, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({
                    errors: [{
                        message: 'Resource not found',
                        type: 'NotFoundError',
                        context: 'Post not found'
                    }]
                }));
                return;
            }

            const resourceMatch = parsedUrl.pathname.match(/\/ghost\/api\/content\/([a-z]+)\//);
            const resourceType = resourceMatch ? resourceMatch[1] : 'unknown';

            const idMatch = parsedUrl.pathname.match(/\/([a-z]+)\/([0-9a-f]+)\/$/);

            res.writeHead(200, {'Content-Type': 'application/json'});

            if (idMatch) {
                res.end(JSON.stringify({
                    [resourceType]: [{id: idMatch[2], title: 'Single Post'}]
                }));
            } else {
                res.end(JSON.stringify({
                    [resourceType]: [
                        {id: '1', title: 'Post 1'},
                        {id: '2', title: 'Post 2'}
                    ],
                    meta: {pagination: {page: 1, total: 2}}
                }));
            }
        });

        server.listen(0, '127.0.0.1', () => {
            serverUrl = `http://127.0.0.1:${server.address().port}`;
            done();
        });
    });

    after(function (done) {
        server.close(done);
    });

    beforeEach(function () {
        lastRequest = null;
        serverBehavior = 'normal';
    });

    it('posts.browse() sends GET with key query param and correct headers', async function () {
        const api = new GhostContentAPI({
            url: serverUrl,
            key: API_KEY,
            version: 'v5.0'
        });

        const result = await api.posts.browse();

        assert.equal(lastRequest.method, 'GET');
        assert.match(lastRequest.pathname, /\/ghost\/api\/content\/posts\/$/);
        assert.equal(lastRequest.query.key, API_KEY);
        assert.equal(lastRequest.headers['accept-version'], 'v5.0');
        assert.equal(lastRequest.headers['user-agent'], `GhostContentSDK/${packageVersion}`);

        assert.equal(result.length, 2);
        assert.equal(result[0].id, '1');
        assert.equal(result[1].title, 'Post 2');
        assert.deepEqual(result.meta, {pagination: {page: 1, total: 2}});
    });

    it('posts.read({id: "1"}) sends GET with id in URL path', async function () {
        const api = new GhostContentAPI({
            url: serverUrl,
            key: API_KEY,
            version: 'v5.0'
        });

        const result = await api.posts.read({id: '1'});

        assert.equal(lastRequest.method, 'GET');
        assert.match(lastRequest.pathname, /\/ghost\/api\/content\/posts\/1\/$/);
        assert.equal(lastRequest.query.key, API_KEY);

        assert.equal(result.id, '1');
        assert.equal(result.title, 'Single Post');
    });

    it('throws a structured error when server returns error JSON', async function () {
        serverBehavior = 'error';

        const api = new GhostContentAPI({
            url: serverUrl,
            key: API_KEY,
            version: 'v5.0'
        });

        await assert.rejects(
            api.posts.browse(),
            (err) => {
                assert.equal(err.message, 'Resource not found');
                assert.equal(err.name, 'NotFoundError');
                assert.equal(err.context, 'Post not found');
                return true;
            }
        );
    });
});

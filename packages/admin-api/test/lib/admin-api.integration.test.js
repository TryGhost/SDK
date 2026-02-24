require('../utils');
const assert = require('assert/strict');
const http = require('http');
const GhostAdminAPI = require('../../lib/admin-api');

describe('GhostAdminAPI Integration (real HTTP)', function () {
    const API_KEY = '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0';

    let server;
    let serverUrl;
    let lastRequest;
    let serverBehavior;

    before(function (done) {
        server = http.createServer((req, res) => {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk;
            });
            req.on('end', () => {
                const parsedBody = body ? JSON.parse(body) : null;
                lastRequest = {
                    method: req.method,
                    url: req.url,
                    headers: req.headers,
                    body: parsedBody
                };

                if (serverBehavior === 'error404') {
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

                if (serverBehavior === 'error500') {
                    res.writeHead(500, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({
                        errors: [{
                            message: 'Internal server error',
                            type: 'InternalServerError'
                        }]
                    }));
                    return;
                }

                const resourceMatch = req.url.match(/\/ghost\/api\/admin\/([a-z]+)\//);
                const resourceType = resourceMatch ? resourceMatch[1] : 'unknown';

                res.writeHead(200, {'Content-Type': 'application/json'});

                if (req.method === 'DELETE') {
                    res.end(JSON.stringify(null));
                    return;
                }

                if (req.method === 'POST') {
                    const items = parsedBody[resourceType] || [{}];
                    res.end(JSON.stringify({
                        [resourceType]: items.map(item => Object.assign({id: 'new-id'}, item))
                    }));
                    return;
                }

                if (req.method === 'PUT') {
                    const items = parsedBody[resourceType] || [{}];
                    res.end(JSON.stringify({
                        [resourceType]: items.map(item => Object.assign({id: '1'}, item))
                    }));
                    return;
                }

                // GET — browse
                res.end(JSON.stringify({
                    [resourceType]: [
                        {id: '1', title: 'Post 1'},
                        {id: '2', title: 'Post 2'}
                    ],
                    meta: {pagination: {page: 1, total: 2}}
                }));
            });
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

    it('posts.browse() sends correct GET request with auth headers and returns parsed response', async function () {
        const api = new GhostAdminAPI({
            url: serverUrl,
            key: API_KEY,
            version: 'v5.0'
        });

        const result = await api.posts.browse();

        assert.equal(lastRequest.method, 'GET');
        assert.match(lastRequest.url, /\/ghost\/api\/admin\/posts\/$/);
        assert.ok(lastRequest.headers.authorization.startsWith('Ghost '));
        assert.equal(lastRequest.headers['accept-version'], 'v5.0');
        assert.ok(lastRequest.headers['user-agent'].startsWith('GhostAdminSDK/'));

        assert.equal(result.length, 2);
        assert.equal(result[0].id, '1');
        assert.equal(result[1].id, '2');
        assert.deepEqual(result.meta, {pagination: {page: 1, total: 2}});
    });

    it('posts.add() sends correct POST request with body and Content-Type', async function () {
        const api = new GhostAdminAPI({
            url: serverUrl,
            key: API_KEY,
            version: 'v5.0'
        });

        const result = await api.posts.add({title: 'Test'});

        assert.equal(lastRequest.method, 'POST');
        assert.match(lastRequest.url, /\/ghost\/api\/admin\/posts\/$/);
        assert.ok(lastRequest.headers['content-type'].includes('application/json'));
        assert.ok(lastRequest.headers.authorization.startsWith('Ghost '));
        assert.deepEqual(lastRequest.body, {posts: [{title: 'Test'}]});

        assert.equal(result.id, 'new-id');
        assert.equal(result.title, 'Test');
    });

    it('posts.edit() sends correct PUT request with id in URL', async function () {
        const api = new GhostAdminAPI({
            url: serverUrl,
            key: API_KEY,
            version: 'v5.0'
        });

        const result = await api.posts.edit({id: '1', title: 'Updated'});

        assert.equal(lastRequest.method, 'PUT');
        assert.match(lastRequest.url, /\/ghost\/api\/admin\/posts\/1\/$/);
        assert.ok(lastRequest.headers.authorization.startsWith('Ghost '));
        assert.deepEqual(lastRequest.body, {posts: [{title: 'Updated'}]});

        assert.equal(result.id, '1');
        assert.equal(result.title, 'Updated');
    });

    it('posts.delete() sends correct DELETE request with id in URL', async function () {
        const api = new GhostAdminAPI({
            url: serverUrl,
            key: API_KEY,
            version: 'v5.0'
        });

        const result = await api.posts.delete({id: '1'});

        assert.equal(lastRequest.method, 'DELETE');
        assert.match(lastRequest.url, /\/ghost\/api\/admin\/posts\/1\//);
        assert.ok(lastRequest.headers.authorization.startsWith('Ghost '));
        assert.equal(result, null);
    });

    it('throws a structured error when server returns 404', async function () {
        serverBehavior = 'error404';

        const api = new GhostAdminAPI({
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

    it('throws a structured error when server returns 500', async function () {
        serverBehavior = 'error500';

        const api = new GhostAdminAPI({
            url: serverUrl,
            key: API_KEY,
            version: 'v5.0'
        });

        await assert.rejects(
            api.posts.browse(),
            (err) => {
                assert.equal(err.message, 'Internal server error');
                assert.equal(err.name, 'InternalServerError');
                return true;
            }
        );
    });
});

// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('./utils');

const http = require('http');
const url = require('url');
const should = require('should');
const GhostContentApi = require('../');

describe('GhostContentApi', function () {
    let server;
    let host;
    const version = 'v2';
    const key = '53c737';

    before(function (done) {
        server = http.createServer();
        server.on('listening', () => {
            const {address, port} = server.address();
            host = `http://${address}:${port}`;
            done();
        });
        server.on('request', (req, res) => {
            const parsedUrl = url.parse(req.url, true);
            server.emit('url', parsedUrl);
            server.emit('headers', req.headers);
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

            const readByIdMatch = parsedUrl.pathname.match(/\/([a-z]+)\/([0-9a-f]+)\/$/);
            const readBySlugMatch = parsedUrl.pathname.match(/\/([a-z]+)\/slug\/([\w]+)\/$/);

            const readMatch = readByIdMatch || readBySlugMatch;
            if (readMatch) {
                const type = readByIdMatch ? 'id' : 'slug';
                data = {
                    [readMatch[1]]: [{
                        [type]: readMatch[2]
                    }]
                };
            }

            res.end(JSON.stringify(data));
        });
        server.listen(0, '127.0.0.1');
    });

    after(function () {
        server.close();
    });

    describe('new GhostContentApi', function () {
        it('Requires a config object with host, version and key', function () {
            try {
                new GhostContentApi();
                return should.fail();
            } catch (err) {
                //
            }

            try {
                new GhostContentApi({host, version});
                return should.fail();
            } catch (err) {
                //
            }

            try {
                new GhostContentApi({version, key});
                return should.fail();
            } catch (err) {
                //
            }

            try {
                new GhostContentApi({host, key});
                return should.fail();
            } catch (err) {
                //
            }

            new GhostContentApi({host, version, key});
        });

        it('Returns an "api" object with posts,tags,authors&pages properties', function () {
            const host = 'https://whatever.com';
            const version = 'v2';
            const key = '53c737';
            const api = new GhostContentApi({host, version, key});

            should.exist(api.posts);
            should.exist(api.tags);
            should.exist(api.authors);
            should.exist(api.pages);
        });

        describe('api.posts', function () {
            it('has a browse method', function () {
                const api = new GhostContentApi({host, version, key});
                should.equal(typeof api.posts.browse, 'function');
            });

            describe('api.posts.browse', function () {
                it('makes a request to the posts resource, using correct version', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({pathname}) => {
                        should.equal(pathname, '/api/v2/content/posts/');
                        done();
                    });

                    api.posts.browse();
                });

                it('supports the include option as an array', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({query}) => {
                        should.deepEqual(query.include, 'authors,tags');
                        done();
                    });

                    api.posts.browse({include: ['authors', 'tags']});
                });

                it('supports the include option as a string', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({query}) => {
                        should.equal(query.include, 'authors,tags');
                        done();
                    });

                    api.posts.browse({include: 'authors,tags'});
                });

                it('resolves with an array of the posts resources, and includes a meta property on the array', function () {
                    const api = new GhostContentApi({host, version, key});

                    return api.posts.browse().then((data) => {
                        should.equal(Array.isArray(data), true);
                        should.exist(data.meta);
                    });
                });

                it('correctly adds the api key to the query', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({query}) => {
                        should.equal(query.key, key);
                        done();
                    });

                    api.posts.browse();
                });

                it('correctly adds the members token to the query', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('headers', (headers) => {
                        should.equal(headers.authorization, 'GhostMembers token');
                        done();
                    });

                    api.posts.browse({}, 'token');
                });
            });

            it('has a read method', function () {
                const api = new GhostContentApi({host, version, key});
                should.equal(typeof api.posts.read, 'function');
            });

            describe('api.posts.read', function () {
                it('makes a request to the post resource, using correct version and id', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({pathname}) => {
                        should.equal(pathname, '/api/v2/content/posts/1/');
                        done();
                    });

                    api.posts.read({id: '1'});
                });

                it('makes a request to the post resource, using correct version and slug', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({pathname}) => {
                        should.equal(pathname, '/api/v2/content/posts/slug/booyar/');
                        done();
                    });

                    api.posts.read({slug: 'booyar'});
                });

                it('supports the include option as an array', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({query}) => {
                        should.deepEqual(query.include, 'authors,tags');
                        done();
                    });

                    api.posts.read({id: '1'}, {include: ['authors', 'tags']});
                });

                it('supports the include option as a string', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({query}) => {
                        should.equal(query.include, 'authors,tags');
                        done();
                    });

                    api.posts.read({id: '1'}, {include: 'authors,tags'});
                });

                it('resolves with the post resource', function () {
                    const api = new GhostContentApi({host, version, key});

                    return api.posts.read({id: '1'}).then((data) => {
                        should.equal(Array.isArray(data), false);
                        should.deepEqual(data, {id: '1'});
                    });
                });

                it('correctly adds the api key to the query', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({query}) => {
                        should.equal(query.key, key);
                        done();
                    });

                    api.posts.read({id: 1});
                });

                it('correctly adds the members token to the query', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('headers', (headers) => {
                        should.equal(headers.authorization, 'GhostMembers token');
                        done();
                    });

                    api.posts.read({id: 1}, {}, 'token');
                });
            });
        });

        describe('api.authors', function () {
            it('has a browse method', function () {
                const api = new GhostContentApi({host, version, key});
                should.equal(typeof api.authors.browse, 'function');
            });

            describe('api.authors.browse', function () {
                it('makes a request to the authors resource, using correct version', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({pathname}) => {
                        should.equal(pathname, '/api/v2/content/authors/');
                        done();
                    });

                    api.authors.browse();
                });

                it('supports the include option as an array', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({query}) => {
                        should.deepEqual(query.include, 'authors,tags');
                        done();
                    });

                    api.authors.browse({include: ['authors', 'tags']});
                });

                it('supports the include option as a string', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({query}) => {
                        should.equal(query.include, 'authors,tags');
                        done();
                    });

                    api.authors.browse({include: 'authors,tags'});
                });

                it('resolves with an array of the authors resources, and includes a meta property on the array', function () {
                    const api = new GhostContentApi({host, version, key});

                    return api.authors.browse().then((data) => {
                        should.equal(Array.isArray(data), true);
                        should.exist(data.meta);
                    });
                });

                it('correctly adds the api key to the query', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({query}) => {
                        should.equal(query.key, key);
                        done();
                    });

                    api.authors.browse();
                });

                it('correctly adds the members token to the query', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('headers', (headers) => {
                        should.equal(headers.authorization, 'GhostMembers token');
                        done();
                    });

                    api.authors.browse({id: 1}, 'token');
                });
            });

            it('has a read method', function () {
                const api = new GhostContentApi({host, version, key});
                should.equal(typeof api.authors.read, 'function');
            });

            describe('api.authors.read', function () {
                it('makes a request to the post resource, using correct version and id', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({pathname}) => {
                        should.equal(pathname, '/api/v2/content/authors/1/');
                        done();
                    });

                    api.authors.read({id: '1'});
                });

                it('makes a request to the user resource, using correct version and slug', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({pathname}) => {
                        should.equal(pathname, '/api/v2/content/authors/slug/booyar/');
                        done();
                    });

                    api.authors.read({slug: 'booyar'});
                });

                it('supports the include option as an array', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({query}) => {
                        should.deepEqual(query.include, 'authors,tags');
                        done();
                    });

                    api.authors.read({id: '1'}, {include: ['authors', 'tags']});
                });

                it('supports the include option as a string', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({query}) => {
                        should.equal(query.include, 'authors,tags');
                        done();
                    });

                    api.authors.read({id: '1'}, {include: 'authors,tags'});
                });

                it('resolves with the post resource', function () {
                    const api = new GhostContentApi({host, version, key});

                    return api.authors.read({id: '1'}).then((data) => {
                        should.equal(Array.isArray(data), false);
                        should.deepEqual(data, {id: '1'});
                    });
                });

                it('correctly adds the api key to the query', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({query}) => {
                        should.equal(query.key, key);
                        done();
                    });

                    api.authors.read({id: 1});
                });

                it('correctly adds the members token to the query', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('headers', (headers) => {
                        should.equal(headers.authorization, 'GhostMembers token');
                        done();
                    });

                    api.authors.read({id: 1}, {}, 'token');
                });
            });
        });

        describe('api.tags', function () {
            it('has a browse method', function () {
                const api = new GhostContentApi({host, version, key});
                should.equal(typeof api.tags.browse, 'function');
            });

            describe('api.tags.browse', function () {
                it('makes a request to the tags resource, using correct version', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({pathname}) => {
                        should.equal(pathname, '/api/v2/content/tags/');
                        done();
                    });

                    api.tags.browse();
                });

                it('supports the include option as an array', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({query}) => {
                        should.deepEqual(query.include, 'authors,tags');
                        done();
                    });

                    api.tags.browse({include: ['authors', 'tags']});
                });

                it('supports the include option as a string', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({query}) => {
                        should.equal(query.include, 'authors,tags');
                        done();
                    });

                    api.tags.browse({include: 'authors,tags'});
                });

                it('resolves with an array of the tags resources, and includes a meta property on the array', function () {
                    const api = new GhostContentApi({host, version, key});

                    return api.tags.browse().then((data) => {
                        should.equal(Array.isArray(data), true);
                        should.exist(data.meta);
                    });
                });

                it('correctly adds the api key to the query', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({query}) => {
                        should.equal(query.key, key);
                        done();
                    });

                    api.tags.browse();
                });

                it('correctly adds the members token to the query', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('headers', (headers) => {
                        should.equal(headers.authorization, 'GhostMembers token');
                        done();
                    });

                    api.tags.browse({id: 1}, 'token');
                });
            });

            it('has a read method', function () {
                const api = new GhostContentApi({host, version, key});
                should.equal(typeof api.tags.read, 'function');
            });

            describe('api.tags.read', function () {
                it('makes a request to the post resource, using correct version and id', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({pathname}) => {
                        should.equal(pathname, '/api/v2/content/tags/1/');
                        done();
                    });

                    api.tags.read({id: '1'});
                });

                it('makes a request to the tag resource, using correct version and slug', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({pathname}) => {
                        should.equal(pathname, '/api/v2/content/tags/slug/booyar/');
                        done();
                    });

                    api.tags.read({slug: 'booyar'});
                });

                it('supports the include option as an array', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({query}) => {
                        should.deepEqual(query.include, 'authors,tags');
                        done();
                    });

                    api.tags.read({id: '1'}, {include: ['authors', 'tags']});
                });

                it('supports the include option as a string', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({query}) => {
                        should.equal(query.include, 'authors,tags');
                        done();
                    });

                    api.tags.read({id: '1'}, {include: 'authors,tags'});
                });

                it('resolves with the tags resource', function () {
                    const api = new GhostContentApi({host, version, key});

                    return api.tags.read({id: '1'}).then((data) => {
                        should.equal(Array.isArray(data), false);
                        should.deepEqual(data, {id: '1'});
                    });
                });

                it('correctly adds the api key to the query', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({query}) => {
                        should.equal(query.key, key);
                        done();
                    });

                    api.tags.read({id: 1});
                });

                it('correctly adds the members token to the query', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('headers', (headers) => {
                        should.equal(headers.authorization, 'GhostMembers token');
                        done();
                    });

                    api.tags.read({id: 1}, {}, 'token');
                });
            });
        });

        describe('api.pages', function () {
            it('has a browse method', function () {
                const api = new GhostContentApi({host, version, key});
                should.equal(typeof api.pages.browse, 'function');
            });

            describe('api.pages.browse', function () {
                it('makes a request to the pages resource, using correct version', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({pathname}) => {
                        should.equal(pathname, '/api/v2/content/pages/');
                        done();
                    });

                    api.pages.browse();
                });

                it('supports the include option as an array', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({query}) => {
                        should.deepEqual(query.include, 'authors,tags');
                        done();
                    });

                    api.pages.browse({include: ['authors', 'tags']});
                });

                it('supports the include option as a string', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({query}) => {
                        should.equal(query.include, 'authors,tags');
                        done();
                    });

                    api.pages.browse({include: 'authors,tags'});
                });

                it('resolves with an array of the pages resources, and includes a meta property on the array', function () {
                    const api = new GhostContentApi({host, version, key});

                    return api.pages.browse().then((data) => {
                        should.equal(Array.isArray(data), true);
                        should.exist(data.meta);
                    });
                });

                it('correctly adds the api key to the query', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('url', ({query}) => {
                        should.equal(query.key, key);
                        done();
                    });

                    api.pages.browse();
                });

                it('correctly adds the members token to the query', function (done) {
                    const api = new GhostContentApi({host, version, key});

                    server.once('headers', (headers) => {
                        should.equal(headers.authorization, 'GhostMembers token');
                        done();
                    });

                    api.posts.browse({id: 1}, 'token');
                });
            });
        });
    });
});

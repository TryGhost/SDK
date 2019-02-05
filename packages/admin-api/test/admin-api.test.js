// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('./utils');
const should = require('should');

const http = require('http');
const url = require('url');

const GhostAdminAPI = require('../');

describe('GhostAdminAPI', function () {
    let server;
    let host;
    const version = 'v2';
    const key = '5c499ae6fa1ad52b62c52331:472d79f1fd958d187fff7be9e76d259a799ae7f69a62513c5b7dceb6c7f747a9';

    before(function (done) {
        server = http.createServer();
        server.on('listening', () => {
            const {address, port} = server.address();
            host = `http://${address}:${port}`;
            done();
        });
        server.on('request', (req, res) => {
            const parsedUrl = url.parse(req.url, true);
            server.emit('method', req.method);
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

            if (req.method === 'POST') {
                data = {
                    [browseMatch[1]]: [{
                        slug: 'new-resource'
                    }]
                };
            }

            if (req.method === 'PUT') {
                const type = idMatch ? 'id' : 'slug';
                data = {
                    [identifierMatch[1]]: [{
                        [type]: identifierMatch[2],
                        slug: 'edited-resource'
                    }]
                };
            }

            if (req.method === 'DELETE') {
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
        try {
            new GhostAdminAPI();
            return should.fail();
        } catch (err) {
            //
        }

        try {
            new GhostAdminAPI({host, version});
            return should.fail();
        } catch (err) {
            //
        }

        try {
            new GhostAdminAPI({version, key});
            return should.fail();
        } catch (err) {
            //
        }

        try {
            new GhostAdminAPI({host, key});
            return should.fail();
        } catch (err) {
            //
        }

        new GhostAdminAPI({host, version, key});
    });

    it('Requires correct key format in config object', function (){
        try {
            new GhostAdminAPI({host, version, key: 'badkey'});
            return should.fail();
        } catch (err) {
            //
        }
    });

    it('Returns an "api" object with posts properties', function () {
        const host = 'https://whatever.com';
        const version = 'v2';
        const key = '5c499ae6fa1ad52b62c52331:472d79f1fd958d187fff7be9e76d259a799ae7f69a62513c5b7dceb6c7f747a9';
        const api = new GhostAdminAPI({host, version, key});

        should.exist(api.posts);
    });

    describe('api.posts', function () {
        it('has a browse method', function () {
            const api = new GhostAdminAPI({host, version, key});
            should.equal(typeof api.posts.browse, 'function');
        });

        describe('api.posts.browse', function () {
            it('makes a request to the posts resource, using correct version', function (done) {
                const api = new GhostAdminAPI({host, version, key});

                server.once('url', ({pathname}) => {
                    should.equal(pathname, '/ghost/api/v2/admin/posts/');
                    done();
                });

                api.posts.browse();
            });

            it('supports the include option as an array', function (done) {
                const api = new GhostAdminAPI({host, version, key});

                server.once('url', ({query}) => {
                    should.deepEqual(query.include, 'authors,tags');
                    done();
                });

                api.posts.browse({include: ['authors', 'tags']});
            });

            it('supports the include option as a string', function (done) {
                const api = new GhostAdminAPI({host, version, key});

                server.once('url', ({query}) => {
                    should.equal(query.include, 'authors,tags');
                    done();
                });

                api.posts.browse({include: 'authors,tags'});
            });

            it('resolves with an array of the posts resources, and includes a meta property on the array', function () {
                const api = new GhostAdminAPI({host, version, key});

                return api.posts.browse().then((data) => {
                    should.equal(Array.isArray(data), true);
                    should.exist(data.meta);
                });
            });
        });

        it('has a read method', function () {
            const api = new GhostAdminAPI({host, version, key});
            should.equal(typeof api.posts.read, 'function');
        });

        describe('api.posts.read', function () {
            it('makes a request to the post resource, using correct version and id', function (done) {
                const api = new GhostAdminAPI({host, version, key});

                server.once('url', ({pathname}) => {
                    should.equal(pathname, '/ghost/api/v2/admin/posts/1/');
                    done();
                });

                api.posts.read({id: '1'});
            });

            it('makes a request to the post resource, using correct version and slug', function (done) {
                const api = new GhostAdminAPI({host, version, key});

                server.once('url', ({pathname}) => {
                    should.equal(pathname, '/ghost/api/v2/admin/posts/slug/booyar/');
                    done();
                });

                api.posts.read({slug: 'booyar'});
            });

            it('supports the include option as an array', function (done) {
                const api = new GhostAdminAPI({host, version, key});

                server.once('url', ({query}) => {
                    should.deepEqual(query.include, 'authors,tags');
                    done();
                });

                api.posts.read({id: '1'}, {include: ['authors', 'tags']});
            });

            it('supports the include option as a string', function (done) {
                const api = new GhostAdminAPI({host, version, key});

                server.once('url', ({query}) => {
                    should.equal(query.include, 'authors,tags');
                    done();
                });

                api.posts.read({id: '1'}, {include: 'authors,tags'});
            });

            it('resolves with the post resource', function () {
                const api = new GhostAdminAPI({host, version, key});

                return api.posts.read({id: '1'}).then((data) => {
                    should.equal(Array.isArray(data), false);
                    should.deepEqual(data, {id: '1'});
                });
            });
        });

        it('has a add method', function () {
            const api = new GhostAdminAPI({host, version, key});
            should.equal(typeof api.posts.add, 'function');
        });

        describe('api.posts.add', function () {
            describe('expected data format', function () {
                it('expects data to be passed in', function (done) {
                    const api = new GhostAdminAPI({host, version, key});

                    api.posts.add().catch((err) => {
                        should.exist(err);
                        done();
                    });
                });

                it('expects author/authors to be passed in', function (done) {
                    const api = new GhostAdminAPI({host, version, key});

                    api.posts.add().catch((err) => {
                        should.exist(err);
                        done();
                    });
                });

                it('should pass with author present', function (done) {
                    const api = new GhostAdminAPI({host, version, key});

                    api.posts.add({
                        author: 1
                    })
                        .then(() => done())
                        .catch(done);
                });

                it('should pass with authors present', function (done) {
                    const api = new GhostAdminAPI({host, version, key});

                    api.posts.add({
                        authors: [1]
                    })
                        .then(() => done())
                        .catch(done);
                });
            });

            it('makes a request to the post resource, using correct version', function (done) {
                const api = new GhostAdminAPI({host, version, key});

                server.once('url', ({pathname}) => {
                    should.equal(pathname, '/ghost/api/v2/admin/posts/');
                    done();
                });

                api.posts.add({
                    title: 'new resource',
                    author: 1
                });
            });

            it('makes POST request to the post resource', function (done) {
                const api = new GhostAdminAPI({host, version, key});

                server.once('method', (method) => {
                    should.equal(method, 'POST');
                    done();
                });

                api.posts.add({
                    title: 'new resource',
                    author: 1
                });
            });

            it('supports the include option as an array', function (done) {
                const api = new GhostAdminAPI({host, version, key});

                server.once('url', ({query}) => {
                    should.deepEqual(query.include, 'authors,tags');
                    done();
                });

                api.posts.add({
                    title: 'new resource',
                    author: 1
                }, {include: ['authors', 'tags']});
            });

            it('supports the include option as a string', function (done) {
                const api = new GhostAdminAPI({host, version, key});

                server.once('url', ({query}) => {
                    should.equal(query.include, 'authors,tags');
                    done();
                });

                api.posts.add({
                    title: 'new resource',
                    author: 1
                }, {include: 'authors,tags'});
            });

            it('resolves with the post resource', function () {
                const api = new GhostAdminAPI({host, version, key});

                return api.posts.add({
                    title: 'new resource',
                    author: 1
                }).then((data) => {
                    should.equal(Array.isArray(data), false);
                    data.slug.should.equal('new-resource');
                });
            });
        });

        it('has a edit method', function () {
            const api = new GhostAdminAPI({host, version, key});
            should.equal(typeof api.posts.edit, 'function');
        });

        describe('api.posts.edit', function () {
            describe('expected data format', function () {
                it('expects data to be passed in', function (done) {
                    const api = new GhostAdminAPI({host, version, key});

                    api.posts.edit().catch((err) => {
                        should.exist(err);
                        done();
                    });
                });

                it('expects data with id to be passed in', function (done) {
                    const api = new GhostAdminAPI({host, version, key});

                    api.posts.edit({
                        slug: 'hey'
                    })
                        .then(() => done())
                        .catch(done);
                });

                it('should pass with id present', function (done) {
                    const api = new GhostAdminAPI({host, version, key});

                    api.posts.edit({
                        id: 1
                    })
                        .then(() => done())
                        .catch(done);
                });
            });

            it('makes a request to the post resource, using correct version', function (done) {
                const api = new GhostAdminAPI({host, version, key});

                server.once('url', ({pathname}) => {
                    should.equal(pathname, '/ghost/api/v2/admin/posts/1/');
                    done();
                });

                api.posts.edit({
                    id: 1,
                    slug: 'edited-resource'
                });
            });

            it('makes PUT request to the post resource', function (done) {
                const api = new GhostAdminAPI({host, version, key});

                server.once('method', (method) => {
                    should.equal(method, 'PUT');
                    done();
                });

                api.posts.edit({
                    id: 1,
                    slug: 'edited-resource'
                });
            });

            it('supports the include option as an array', function (done) {
                const api = new GhostAdminAPI({host, version, key});

                server.once('url', ({query}) => {
                    should.deepEqual(query.include, 'authors,tags');
                    done();
                });

                api.posts.edit({
                    id: 1,
                    slug: 'edited-resource'
                }, {include: ['authors', 'tags']});
            });

            it('supports the include option as a string', function (done) {
                const api = new GhostAdminAPI({host, version, key});

                server.once('url', ({query}) => {
                    should.equal(query.include, 'authors,tags');
                    done();
                });

                api.posts.edit({
                    id: 1,
                    slug: 'edited-resource'
                }, {include: 'authors,tags'});
            });

            it('resolves with edited post resource', function () {
                const api = new GhostAdminAPI({host, version, key});

                return api.posts.edit({
                    id: '5c546f8e5b7ad04a47c05756',
                    slug: 'edited-resource'
                }).then((data) => {
                    should.equal(Array.isArray(data), false);
                    data.slug.should.equal('edited-resource');
                });
            });
        });

        it('has a destroy method', function () {
            const api = new GhostAdminAPI({host, version, key});
            should.equal(typeof api.posts.destroy, 'function');
        });

        describe('api.posts.destroy', function () {
            describe('expected data format', function () {
                it('expects data to be passed in', function (done) {
                    const api = new GhostAdminAPI({host, version, key});

                    api.posts.destroy().catch((err) => {
                        should.exist(err);
                        done();
                    });
                });

                it('expects data with id to be passed in', function (done) {
                    const api = new GhostAdminAPI({host, version, key});

                    api.posts.destroy({
                        slug: 'hey'
                    }).catch((err) => {
                        should.exist(err);
                        done();
                    });
                });

                it('should pass with id present', function (done) {
                    const api = new GhostAdminAPI({host, version, key});

                    api.posts.destroy({
                        id: 1
                    })
                        .then(() => done())
                        .catch(done);
                });
            });

            it('makes a request to the post resource, using correct version', function (done) {
                const api = new GhostAdminAPI({host, version, key});

                server.once('url', ({pathname}) => {
                    should.equal(pathname, '/ghost/api/v2/admin/posts/1/');
                    done();
                });

                api.posts.destroy({
                    id: 1
                });
            });

            it('makes DELETE request to the post resource', function (done) {
                const api = new GhostAdminAPI({host, version, key});

                server.once('method', (method) => {
                    should.equal(method, 'DELETE');
                    done();
                });

                api.posts.destroy({
                    id: 1
                });
            });

            it('resolves with empty post resource', function () {
                const api = new GhostAdminAPI({host, version, key});

                return api.posts.destroy({
                    id: 1
                }).then((data) => {
                    should.equal(data, null);
                });
            });
        });
    });
});

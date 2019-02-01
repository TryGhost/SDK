// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('./utils');
const should = require('should');

const http = require('http');
const url = require('url');

const GhostAdminAPI = require('../');

describe.only('GhostAdminAPI', function () {
    let server;
    let host = 'http://ghost.local';
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
    });
});

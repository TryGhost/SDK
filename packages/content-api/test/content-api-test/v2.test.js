// Switch these lines once there are useful utils
// const testUtils = require('./utils');

const should = require('should');

const {getInstance} = require('../utils/ghost-server-mock');
const GhostContentApi = require('../../cjs/content-api');

describe('GhostContentApi v2', function () {
    let server;
    const config = {
        version: 'v2',
        key: '0123456789abcdef0123456789'
    };

    beforeEach(function () {
        config.returnError = false;
    });

    before(function (done) {
        server = getInstance(config, (serverURL) => {
            config.url = serverURL;
            done();
        });
    });

    after(function () {
        server.close();
    });

    describe('api.posts', function () {
        it('has a browse method', function () {
            const api = new GhostContentApi(config);
            should.equal(typeof api.posts.browse, 'function');
        });

        describe('api.posts.browse', function () {
            it('makes a request to the posts resource, using correct version', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({pathname}) => {
                    should.equal(pathname, '/ghost/api/v2/content/posts/');
                    done();
                });

                api.posts.browse();
            });

            it('supports the include option as an array', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({query}) => {
                    should.deepEqual(query.include, 'authors,tags');
                    done();
                });

                api.posts.browse({include: ['authors', 'tags']});
            });

            it('supports the include option as a string', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({query}) => {
                    should.equal(query.include, 'authors,tags');
                    done();
                });

                api.posts.browse({include: 'authors,tags'});
            });

            it('resolves with an array of the posts resources, and includes a meta property on the array', function () {
                const api = new GhostContentApi(config);

                return api.posts.browse().then((data) => {
                    should.equal(Array.isArray(data), true);
                    should.exist(data.meta);
                });
            });

            it('correctly adds the api key to the query', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({query}) => {
                    should.equal(query.key, config.key);
                    done();
                });

                api.posts.browse();
            });

            it('correctly adds the members token to the query', function (done) {
                const api = new GhostContentApi(config);

                server.once('headers', (headers) => {
                    should.equal(headers.authorization, 'GhostMembers token');
                    done();
                });

                api.posts.browse({}, 'token');
            });
        });

        it('has a read method', function () {
            const api = new GhostContentApi(config);
            should.equal(typeof api.posts.read, 'function');
        });

        describe('api.posts.read', function () {
            it('makes a request to the post resource, using correct version and id', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({pathname}) => {
                    should.equal(pathname, '/ghost/api/v2/content/posts/1/');
                    done();
                });

                api.posts.read({id: '1'});
            });

            it('makes a request to the post resource, using correct version and slug', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({pathname}) => {
                    should.equal(pathname, '/ghost/api/v2/content/posts/slug/booyar/');
                    done();
                });

                api.posts.read({slug: 'booyar'});
            });

            it('supports the include option as an array', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({query}) => {
                    should.deepEqual(query.include, 'authors,tags');
                    done();
                });

                api.posts.read({id: '1'}, {include: ['authors', 'tags']});
            });

            it('supports the include option as a string', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({query}) => {
                    should.equal(query.include, 'authors,tags');
                    done();
                });

                api.posts.read({id: '1'}, {include: 'authors,tags'});
            });

            it('supports the include option in first parameter', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({query}) => {
                    should.equal(query.include, 'authors,tags');
                    done();
                });

                api.posts.read({id: '1', include: 'authors,tags'});
            });

            it('resolves with the post resource', function () {
                const api = new GhostContentApi(config);

                return api.posts.read({id: '1'}).then((data) => {
                    should.equal(Array.isArray(data), false);
                    should.deepEqual(data, {id: '1'});
                });
            });

            it('correctly adds the api key to the query', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({query}) => {
                    should.equal(query.key, config.key);
                    done();
                });

                api.posts.read({id: 1});
            });

            it('correctly adds the members token to the query', function (done) {
                const api = new GhostContentApi(config);

                server.once('headers', (headers) => {
                    should.equal(headers.authorization, 'GhostMembers token');
                    done();
                });

                api.posts.read({id: 1}, {}, 'token');
            });

            it('errors correctly for an empty object', function (done) {
                const api = new GhostContentApi(config);

                api.posts.read()
                    .then(() => {
                        done('expected failure');
                    })
                    .catch((err) => {
                        should.exist(err);
                        done();
                    });
            });
        });
    });

    describe('api.authors', function () {
        it('has a browse method', function () {
            const api = new GhostContentApi(config);
            should.equal(typeof api.authors.browse, 'function');
        });

        describe('api.authors.browse', function () {
            it('makes a request to the authors resource, using correct version', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({pathname}) => {
                    should.equal(pathname, '/ghost/api/v2/content/authors/');
                    done();
                });

                api.authors.browse();
            });

            it('supports the include option as an array', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({query}) => {
                    should.deepEqual(query.include, 'authors,tags');
                    done();
                });

                api.authors.browse({include: ['authors', 'tags']});
            });

            it('supports the include option as a string', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({query}) => {
                    should.equal(query.include, 'authors,tags');
                    done();
                });

                api.authors.browse({include: 'authors,tags'});
            });

            it('resolves with an array of the authors resources, and includes a meta property on the array', function () {
                const api = new GhostContentApi(config);

                return api.authors.browse().then((data) => {
                    should.equal(Array.isArray(data), true);
                    should.exist(data.meta);
                });
            });

            it('correctly adds the api key to the query', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({query}) => {
                    should.equal(query.key, config.key);
                    done();
                });

                api.authors.browse();
            });

            it('correctly adds the members token to the query', function (done) {
                const api = new GhostContentApi(config);

                server.once('headers', (headers) => {
                    should.equal(headers.authorization, 'GhostMembers token');
                    done();
                });

                api.authors.browse({id: 1}, 'token');
            });

            it('request fails', function () {
                const api = new GhostContentApi(config);

                config.returnError = true;

                return api.authors.browse({id: 1}, 'token')
                    .then(() => {
                        throw new Error('expected failure');
                    })
                    .catch((err) => {
                        should.exist(err);

                        should.equal(true, err instanceof Error);
                        err.name.should.eql('NotFoundError');

                        should.exist(err.response);
                        should.exist(err.message);
                        should.exist(err.context);
                        should.exist(err.help);
                        should.exist(err.id);
                        should.exist(err.details);
                        should.exist(err.code);
                        should.exist(err.type);
                    });
            });
        });

        it('has a read method', function () {
            const api = new GhostContentApi(config);
            should.equal(typeof api.authors.read, 'function');
        });

        describe('api.authors.read', function () {
            it('makes a request to the post resource, using correct version and id', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({pathname}) => {
                    should.equal(pathname, '/ghost/api/v2/content/authors/1/');
                    done();
                });

                api.authors.read({id: '1'});
            });

            it('makes a request to the user resource, using correct version and slug', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({pathname}) => {
                    should.equal(pathname, '/ghost/api/v2/content/authors/slug/booyar/');
                    done();
                });

                api.authors.read({slug: 'booyar'});
            });

            it('supports the include option as an array', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({query}) => {
                    should.deepEqual(query.include, 'authors,tags');
                    done();
                });

                api.authors.read({id: '1'}, {include: ['authors', 'tags']});
            });

            it('supports the include option as a string', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({query}) => {
                    should.equal(query.include, 'authors,tags');
                    done();
                });

                api.authors.read({id: '1'}, {include: 'authors,tags'});
            });

            it('supports the include option in first parameter', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({query}) => {
                    should.equal(query.include, 'authors,tags');
                    done();
                });

                api.authors.read({id: '1', include: 'authors,tags'});
            });

            it('resolves with the author resource', function () {
                const api = new GhostContentApi(config);

                return api.authors.read({id: '1'}).then((data) => {
                    should.equal(Array.isArray(data), false);
                    should.deepEqual(data, {id: '1'});
                });
            });

            it('correctly adds the api key to the query', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({query}) => {
                    should.equal(query.key, config.key);
                    done();
                });

                api.authors.read({id: 1});
            });

            it('correctly adds the members token to the query', function (done) {
                const api = new GhostContentApi(config);

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
            const api = new GhostContentApi(config);
            should.equal(typeof api.tags.browse, 'function');
        });

        describe('api.tags.browse', function () {
            it('makes a request to the tags resource, using correct version', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({pathname}) => {
                    should.equal(pathname, '/ghost/api/v2/content/tags/');
                    done();
                });

                api.tags.browse();
            });

            it('supports the include option as an array', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({query}) => {
                    should.deepEqual(query.include, 'authors,tags');
                    done();
                });

                api.tags.browse({include: ['authors', 'tags']});
            });

            it('supports the include option as a string', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({query}) => {
                    should.equal(query.include, 'authors,tags');
                    done();
                });

                api.tags.browse({include: 'authors,tags'});
            });

            it('resolves with an array of the tags resources, and includes a meta property on the array', function () {
                const api = new GhostContentApi(config);

                return api.tags.browse().then((data) => {
                    should.equal(Array.isArray(data), true);
                    should.exist(data.meta);
                });
            });

            it('correctly adds the api key to the query', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({query}) => {
                    should.equal(query.key, config.key);
                    done();
                });

                api.tags.browse();
            });

            it('correctly adds the members token to the query', function (done) {
                const api = new GhostContentApi(config);

                server.once('headers', (headers) => {
                    should.equal(headers.authorization, 'GhostMembers token');
                    done();
                });

                api.tags.browse({id: 1}, 'token');
            });
        });

        it('has a read method', function () {
            const api = new GhostContentApi(config);
            should.equal(typeof api.tags.read, 'function');
        });

        describe('api.tags.read', function () {
            it('makes a request to the post resource, using correct version and id', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({pathname}) => {
                    should.equal(pathname, '/ghost/api/v2/content/tags/1/');
                    done();
                });

                api.tags.read({id: '1'});
            });

            it('makes a request to the tag resource, using correct version and slug', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({pathname}) => {
                    should.equal(pathname, '/ghost/api/v2/content/tags/slug/booyar/');
                    done();
                });

                api.tags.read({slug: 'booyar'});
            });

            it('supports the include option as an array', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({query}) => {
                    should.deepEqual(query.include, 'authors,tags');
                    done();
                });

                api.tags.read({id: '1'}, {include: ['authors', 'tags']});
            });

            it('supports the include option as a string', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({query}) => {
                    should.equal(query.include, 'authors,tags');
                    done();
                });

                api.tags.read({id: '1'}, {include: 'authors,tags'});
            });

            it('supports the include option in first parameter', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({query}) => {
                    should.equal(query.include, 'authors,tags');
                    done();
                });

                api.tags.read({id: '1', include: 'authors,tags'});
            });

            it('resolves with the tags resource', function () {
                const api = new GhostContentApi(config);

                return api.tags.read({id: '1'}).then((data) => {
                    should.equal(Array.isArray(data), false);
                    should.deepEqual(data, {id: '1'});
                });
            });

            it('correctly adds the api key to the query', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({query}) => {
                    should.equal(query.key, config.key);
                    done();
                });

                api.tags.read({id: 1});
            });

            it('correctly adds the members token to the query', function (done) {
                const api = new GhostContentApi(config);

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
            const api = new GhostContentApi(config);
            should.equal(typeof api.pages.browse, 'function');
        });

        describe('api.pages.browse', function () {
            it('makes a request to the pages resource, using correct version', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({pathname}) => {
                    should.equal(pathname, '/ghost/api/v2/content/pages/');
                    done();
                });

                api.pages.browse();
            });

            it('supports the include option as an array', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({query}) => {
                    should.deepEqual(query.include, 'authors,tags');
                    done();
                });

                api.pages.browse({include: ['authors', 'tags']});
            });

            it('supports the include option as a string', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({query}) => {
                    should.equal(query.include, 'authors,tags');
                    done();
                });

                api.pages.browse({include: 'authors,tags'});
            });

            it('resolves with an array of the pages resources, and includes a meta property on the array', function () {
                const api = new GhostContentApi(config);

                return api.pages.browse().then((data) => {
                    should.equal(Array.isArray(data), true);
                    should.exist(data.meta);
                });
            });

            it('correctly adds the api key to the query', function (done) {
                const api = new GhostContentApi(config);

                server.once('url', ({query}) => {
                    should.equal(query.key, config.key);
                    done();
                });

                api.pages.browse();
            });

            it('correctly adds the members token to the query', function (done) {
                const api = new GhostContentApi(config);

                server.once('headers', (headers) => {
                    should.equal(headers.authorization, 'GhostMembers token');
                    done();
                });

                api.pages.browse({id: 1}, 'token');
            });
        });
    });
});

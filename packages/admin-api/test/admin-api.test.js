// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('./utils');
const should = require('should');

const http = require('http');
const url = require('url');
const path = require('path');

const GhostAdminAPI = require('../');

describe('GhostAdminAPI', function () {
    let server;
    const config = {
        version: 'v2',
        key: '5c499ae6fa1ad52b62c52331:472d79f1fd958d187fff7be9e76d259a799ae7f69a62513c5b7dceb6c7f747a9'
    };

    let returnError;

    beforeEach(() => {
        returnError = false;
    });

    before(function (done) {
        server = http.createServer();
        server.on('listening', () => {
            const {address, port} = server.address();
            config.url = `http://${address}:${port}`;
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
        try {
            new GhostAdminAPI();
            return should.fail();
        } catch (err) {
            //
        }

        try {
            new GhostAdminAPI({url: config.url, version: config.version});
            return should.fail();
        } catch (err) {
            //
        }

        try {
            new GhostAdminAPI({version: config.version, key: config.key});
            return should.fail();
        } catch (err) {
            //
        }

        try {
            new GhostAdminAPI({url: config.url, key: config.key});
            return should.fail();
        } catch (err) {
            //
        }

        new GhostAdminAPI({url: config.url, version: config.version, key: config.key});
        new GhostAdminAPI(config);
    });

    it('Requires correct key format in config object', function (){
        try {
            new GhostAdminAPI({key: 'badkey', config: config.url, version: config.version});
            return should.fail();
        } catch (err) {
            //
        }
    });

    ['posts', 'pages', 'tags'].forEach((resource) => {
        describe(`api.${resource}`, function () {
            describe(`api.${resource}.browse`, function () {
                it('using correct api version', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('url', ({pathname}) => {
                        should.equal(pathname, `/ghost/api/v2/admin/${resource}/`);
                        done();
                    });

                    api[resource].browse();
                });

                it('can include relations as array', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('url', ({query}) => {
                        should.deepEqual(query.include, 'authors,tags');
                        done();
                    });

                    api[resource].browse({include: ['authors', 'tags']});
                });

                it('can include relations as strings', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('url', ({query}) => {
                        should.equal(query.include, 'authors,tags');
                        done();
                    });

                    api[resource].browse({include: 'authors,tags'});
                });

                it('resolves with data array', function () {
                    const api = new GhostAdminAPI(config);

                    return api[resource].browse().then((data) => {
                        should.equal(Array.isArray(data), true);
                    });
                });
            });

            describe(`api.${resource}.read`, function () {
                it('uses correct api version', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('url', ({pathname}) => {
                        should.equal(pathname, `/ghost/api/v2/admin/${resource}/1/`);
                        done();
                    });

                    api[resource].read({id: '1'});
                });

                it('by slug', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('url', ({pathname}) => {
                        should.equal(pathname, `/ghost/api/v2/admin/${resource}/slug/booyar/`);
                        done();
                    });

                    api[resource].read({slug: 'booyar'});
                });

                it('can include relations as array', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('url', ({query}) => {
                        should.deepEqual(query.include, 'authors,tags');
                        done();
                    });

                    api[resource].read({id: '1'}, {include: ['authors', 'tags']});
                });

                it('can include relations as arrays', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('url', ({query}) => {
                        should.equal(query.include, 'authors,tags');
                        done();
                    });

                    api[resource].read({id: '1'}, {include: 'authors,tags'});
                });

                it('resolves with data', function () {
                    const api = new GhostAdminAPI(config);

                    return api[resource].read({id: '1'}).then((data) => {
                        should.equal(Array.isArray(data), false);
                        should.deepEqual(data, {id: '1'});
                    });
                });
            });

            describe(`api.${resource}.add`, function () {
                it('request fails', function () {
                    const api = new GhostAdminAPI(config);

                    returnError = true;

                    return api[resource].add({authors: [{id: 'id'}]})
                        .then(() => {
                            throw new Error('expected failure.');
                        })
                        .catch((err) => {
                            should.exist(err);

                            should.equal(true, err instanceof Error);
                            err.name.should.eql('ValidationError');

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

                it('expects data to be passed in', function (done) {
                    const api = new GhostAdminAPI(config);

                    api[resource].add().catch((err) => {
                        should.exist(err);
                        done();
                    });
                });

                it('uses correct api version', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('url', ({pathname}) => {
                        should.equal(pathname, `/ghost/api/v2/admin/${resource}/`);
                        done();
                    });

                    api[resource].add({
                        attr: 'value'
                    });
                });

                it('ensure method is correct', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('method', (method) => {
                        should.equal(method, 'POST');
                        done();
                    });

                    api[resource].add({
                        attr: 'value'
                    });
                });

                it('can include relations as array', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('url', ({query}) => {
                        should.deepEqual(query.include, 'authors,tags');
                        done();
                    });

                    api[resource].add({
                        attr: 'value'
                    }, {include: ['authors', 'tags']});
                });

                it('can include relations as strings', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('url', ({query}) => {
                        should.equal(query.include, 'authors,tags');
                        done();
                    });

                    api[resource].add({
                        attr: 'value'
                    }, {include: 'authors,tags'});
                });

                it('resolves with data', function () {
                    const api = new GhostAdminAPI(config);

                    return api[resource].add({
                        attr: 'value'
                    }).then((data) => {
                        should.equal(Array.isArray(data), false);
                        data.slug.should.equal('new-resource');
                    });
                });
            });

            describe(`api.${resource}.edit`, function () {
                it('expects data to be passed in', function (done) {
                    const api = new GhostAdminAPI(config);

                    api[resource].edit().catch((err) => {
                        should.exist(err);
                        done();
                    });
                });

                it('with id', function (done) {
                    const api = new GhostAdminAPI(config);

                    api[resource].edit({
                        id: 1
                    }).then(() => done()).catch(done);
                });

                it('uses correct api version', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('url', ({pathname}) => {
                        should.equal(pathname, `/ghost/api/v2/admin/${resource}/1/`);
                        done();
                    });

                    api[resource].edit({
                        id: 1
                    });
                });

                it('ensures HTTP method', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('method', (method) => {
                        should.equal(method, 'PUT');
                        done();
                    });

                    api[resource].edit({
                        id: 1
                    });
                });

                it('can include relations as array', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('url', ({query}) => {
                        should.deepEqual(query.include, 'authors,tags');
                        done();
                    });

                    api[resource].edit({
                        id: 1
                    }, {include: ['authors', 'tags']});
                });

                it('can include relations as string', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('url', ({query}) => {
                        should.equal(query.include, 'authors,tags');
                        done();
                    });

                    api[resource].edit({
                        id: 1
                    }, {include: 'authors,tags'});
                });

                it('resolves with data', function () {
                    const api = new GhostAdminAPI(config);

                    return api[resource].edit({
                        id: '5c546f8e5b7ad04a47c05756',
                        slug: 'edited-resource'
                    }).then((data) => {
                        should.equal(Array.isArray(data), false);
                        data.slug.should.equal('edited-resource');
                    });
                });
            });

            describe(`api.${resource}.destroy`, function () {
                it('expects data to be passed in', function (done) {
                    const api = new GhostAdminAPI(config);

                    api[resource].destroy().catch((err) => {
                        should.exist(err);
                        done();
                    });
                });

                it('expects data with id to be passed in', function (done) {
                    const api = new GhostAdminAPI(config);

                    api[resource].destroy({
                        slug: 'hey'
                    }).catch((err) => {
                        should.exist(err);
                        done();
                    });
                });

                it('should pass with id present', function (done) {
                    const api = new GhostAdminAPI(config);

                    api[resource].destroy({
                        id: 1
                    }).then(() => done()).catch(done);
                });

                it('uses correct api version', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('url', ({pathname}) => {
                        should.equal(pathname, `/ghost/api/v2/admin/${resource}/1/`);
                        done();
                    });

                    api[resource].destroy({
                        id: 1
                    });
                });

                it('uses correct HTTP method', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('method', (method) => {
                        should.equal(method, 'DELETE');
                        done();
                    });

                    api[resource].destroy({
                        id: 1
                    });
                });

                it('resolves with empty data', function () {
                    const api = new GhostAdminAPI(config);

                    return api[resource].destroy({
                        id: 1
                    }).then((data) => {
                        should.equal(data, null);
                    });
                });
            });
        });
    });

    describe('api.images', function () {
        it('has a add method', function () {
            const api = new GhostAdminAPI(config);
            should.equal(typeof api.images.upload, 'function');
        });

        describe('api.images.upload', function () {
            const imagePath = path.join(__dirname, './fixtures/ghost-logo.png');

            describe('expected data format', function () {
                it('expects data to be passed in', function (done) {
                    const api = new GhostAdminAPI(config);

                    api.images.upload().catch((err) => {
                        should.exist(err);
                        done();
                    });
                });

                it('expects data.path to be passed in', function (done) {
                    const api = new GhostAdminAPI(config);

                    api.images.upload({}).catch((err) => {
                        should.exist(err);
                        done();
                    });
                });

                it('should pass with path present', function (done) {
                    const api = new GhostAdminAPI(config);

                    api.images.upload({
                        file: imagePath
                    })
                        .then(() => done())
                        .catch(done);
                });
            });

            it('makes a request to the /images/upload endpoint, using correct version', function (done) {
                const api = new GhostAdminAPI(config);

                server.once('url', ({pathname}) => {
                    should.equal(pathname, '/ghost/api/v2/admin/images/upload/');
                    done();
                });

                api.images.upload({
                    file: imagePath
                });
            });

            it('makes POST request to the /images endpoint', function (done) {
                const api = new GhostAdminAPI(config);

                server.once('method', (method) => {
                    should.equal(method, 'POST');
                    done();
                });

                api.images.upload({
                    file: imagePath
                });
            });

            it('resolves with the url resource', function () {
                const api = new GhostAdminAPI(config);

                return api.images.upload({
                    file: imagePath
                }).then((data) => {
                    should.equal(Array.isArray(data), false);
                    data.url.should.equal(`${config.url}/image/url`);
                });
            });
        });
    });

    describe('api.config.read', function () {
        it('makes a GET request to the config endpoint', function (done) {
            const api = new GhostAdminAPI(config);

            server.once('url', ({pathname}) => {
                should.equal(pathname, '/ghost/api/v2/admin/config/');
                done();
            });

            api.config.read();
        });
    });

    it('allows makeRequest override', function () {
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
});

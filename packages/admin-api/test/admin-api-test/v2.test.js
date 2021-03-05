// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../utils');
const should = require('should');
const FormData = require('form-data');
const path = require('path');

const {getInstance} = require('../utils/ghost-server-mock');
const GhostAdminAPI = require('../../lib');

describe('GhostAdminAPI v2', function () {
    const API_VERSION = 'v2';
    const config = {
        // url: `http://localhost:2368`,    // NOTE: comment out to run the test against local version, remember to remove "before" clauses and changes the key below
        version: API_VERSION,
        key: '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0',
        returnError: false
    };
    let server;

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

    // eslint-disable-next-line
    ['posts', 'pages', 'tags'].forEach((resource) => {
        describe(`api.${resource}`, function () {
            describe(`api.${resource}.browse`, function () {
                it('using correct api version', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('url', ({pathname}) => {
                        should.equal(pathname, `/ghost/api/${API_VERSION}/admin/${resource}/`);
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

                it('can include fields as strings', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('url', ({query}) => {
                        should.equal(query.fields, 'id,slug');
                        done();
                    });

                    api[resource].browse({fields: 'id,slug'});
                });

                it('can include fields as array', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('url', ({query}) => {
                        should.deepEqual(query.fields, 'id,slug');
                        done();
                    });

                    api[resource].browse({fields: ['id', 'slug']});
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
                        should.equal(pathname, `/ghost/api/${API_VERSION}/admin/${resource}/1/`);
                        done();
                    });

                    api[resource].read({id: '1'});
                });

                it('by slug', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('url', ({pathname}) => {
                        should.equal(pathname, `/ghost/api/${API_VERSION}/admin/${resource}/slug/booyar/`);
                        done();
                    });

                    api[resource].read({slug: 'booyar'});
                });

                it('by email', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('url', ({pathname}) => {
                        should.equal(pathname, `/ghost/api/${API_VERSION}/admin/${resource}/email/test@example.com/`);
                        done();
                    });

                    api[resource].read({email: 'test@example.com'});
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

                it('can include fields as strings', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('url', ({query}) => {
                        should.equal(query.fields, 'id,slug');
                        done();
                    });

                    api[resource].read({id: 1, fields: 'id,slug'});
                });

                it('can include fields as array', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('url', ({query}) => {
                        should.deepEqual(query.fields, 'id,slug');
                        done();
                    });

                    api[resource].read({id: 1, fields: ['id', 'slug']});
                });

                it('can include fields as strings in second parameter', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('url', ({query}) => {
                        should.equal(query.fields, 'id,slug');
                        done();
                    });

                    api[resource].read({id: 1}, {fields: 'id,slug'});
                });

                it('can include fields as array in second parameter', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('url', ({query}) => {
                        should.deepEqual(query.fields, 'id,slug');
                        done();
                    });

                    api[resource].read({id: 1}, {fields: ['id', 'slug']});
                });

                it('can combine multiple properties in first parameter', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('url', ({pathname, query}) => {
                        should.equal(pathname, `/ghost/api/${API_VERSION}/admin/${resource}/slug/kevin/`);

                        should.deepEqual(query.fields, 'id,slug');
                        should.deepEqual(query.include, 'author,tag');
                        done();
                    });

                    api[resource].read({slug: 'kevin', fields: ['id', 'slug'], include: 'author,tag'});
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

                    config.returnError = true;

                    return api[resource].add({authors: [{id: 'id'}]})
                        .then(() => {
                            throw new Error('expected failure.');
                        })
                        .catch((err) => {
                            should.exist(err);

                            should.equal(true, err instanceof Error);
                            err.name.should.eql('ValidationError');

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
                        should.equal(pathname, `/ghost/api/${API_VERSION}/admin/${resource}/`);
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
                        should.equal(pathname, `/ghost/api/${API_VERSION}/admin/${resource}/1/`);
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

            describe(`api.${resource}.delete`, function () {
                it('expects data to be passed in', function (done) {
                    const api = new GhostAdminAPI(config);

                    api[resource].delete().catch((err) => {
                        should.exist(err);
                        done();
                    });
                });

                it('expects data with id to be passed in', function (done) {
                    const api = new GhostAdminAPI(config);

                    api[resource].delete({
                        slug: 'hey'
                    }).catch((err) => {
                        should.exist(err);
                        done();
                    });
                });

                it('should pass with id present', function (done) {
                    const api = new GhostAdminAPI(config);

                    api[resource].delete({
                        id: 1
                    }).then(() => done()).catch(done);
                });

                it('should pass with email present', function (done) {
                    const api = new GhostAdminAPI(config);

                    api[resource].delete({
                        email: 'test@example.com'
                    }).then(() => done()).catch(done);
                });

                it('uses correct api version', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('url', ({pathname}) => {
                        should.equal(pathname, `/ghost/api/${API_VERSION}/admin/${resource}/1/`);
                        done();
                    });

                    api[resource].delete({
                        id: 1
                    });
                });

                it('uses correct HTTP method', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('method', (method) => {
                        should.equal(method, 'DELETE');
                        done();
                    });

                    api[resource].delete({
                        id: 1
                    });
                });

                it('resolves with empty data', function () {
                    const api = new GhostAdminAPI(config);

                    return api[resource].delete({
                        id: 1
                    }).then((data) => {
                        should.equal(data, null);
                    });
                });
            });
        });
    });

    describe('Upload Endpoints', function () {
        describe('api.images', function () {
            it('has a add method', function () {
                const api = new GhostAdminAPI(config);
                should.equal(typeof api.images.upload, 'function');
            });

            describe('api.images.upload', function () {
                let imagePath;

                beforeEach(function () {
                    imagePath = path.join(__dirname, '../fixtures/ghost-logo.png');
                });

                describe('expected data format', function () {
                    it('errors if passed no data', function (done) {
                        const api = new GhostAdminAPI(config);

                        api.images
                            .upload()
                            .then(() => {
                                done(new Error('Expected an error'));
                            })
                            .catch((err) => {
                                should.exist(err);
                                err.should.match(/Missing/);
                                done();
                            });
                    });

                    it('errors for invalid object', function (done) {
                        const api = new GhostAdminAPI(config);

                        api.images
                            .upload({})
                            .then(() => {
                                done(new Error('Expected an error'));
                            })
                            .catch((err) => {
                                should.exist(err);
                                err.should.match(/FormData/);
                                done();
                            });
                    });

                    it('should pass with FormData present', function (done) {
                        const api = new GhostAdminAPI(config);

                        api.images
                            .upload(new FormData)
                            .then(() => done())
                            .catch(done);
                    });

                    it('should pass with data.file present', function (done) {
                        const api = new GhostAdminAPI(config);

                        api.images
                            .upload({
                                file: imagePath
                            })
                            .then(() => done())
                            .catch(done);
                    });
                });

                it('makes a request to the /images/upload endpoint, using correct version', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('url', ({pathname}) => {
                        should.equal(pathname, `/ghost/api/${API_VERSION}/admin/images/upload/`);
                        done();
                    });

                    api.images.upload({
                        file: imagePath
                    });
                });

                it('makes POST request to the /images/upload endpoint', function (done) {
                    const api = new GhostAdminAPI(config);

                    server.once('method', (method) => {
                        should.equal(method, 'POST');
                        done();
                    });

                    const formData = new FormData();
                    formData.append('file', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAjbwAAI28BNfwH+wAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAjLSURBVHja7Z15bBRVHMdLQeUUSFSU4IERA8glZ6WlQGkRKQV60cO2HKnlFjCCJEaBGIpRTEQSFf8wahODBjXeCoJbEISKSCktFawFWqC0FDRgOPX5+zVvzdjObndm3sy+N/P745PwB93d9/1+dnaON28iGGMRhHehEEgACoEEIEgAggSwFd/ohzoAI4BkYBHwIlAEfA9UAgeB7cCHwOvAGiAJ6K5quPDZb+fjfQF4g49tOx9rJR97Ec9iEf+/mFEHVwgAA+kIpAKbgUsAM8HfPLDXuBBtJS68PZABbAIqTI4XucgzS7FbBrtCSAc+sFB6MGqA54A7JSq+H/AqcN6G8WpluFlqAeADTgV+tyEEPa7xYB4IY/EJwE6HxoscAxKlEwA+VB/gKweD0HKF7y+0d7D4+4BPwjRe5AtR4lsNohNQCFwNYxh+qoDJDuzIomyXJRgvir8WOwiLAPDGDwK/SRBEc14CIm0ovzdQKuF4sYM+jgoAbxgFNEgYhp9Pgc6Cf+sbJR5vPTDSEQH4jt5fEofhB7+t9wgofzlwQ4HxXjLzE2g0jLmKhOHnONDTQvnrFBorch2YbYsA8MJPKRaGn0NAVxPlP6PoeJGFQgWAFxyv2De/OcXALQbKn6fwWP1bghghAuAmFKhTPBBkc4jlp/DTz6qP9zTQw5IA8ALtgF12ftDd4x5mpVNjWUVaAjuaPZlVz5rOagrSWW3BDFaWHMeKYwaKfL+8VsbbC7jggvL9+LBDKwKst+OD7UsYwY7MmMhq52awxmWzg1KeFi/yvbHcXgHG2gbY4aLy/bxsSgA85yz6w+A3/cyC7FZL13JmfpboQL4NMN6nXVi+n0RDAuAlV369WsgH2P/Y6KZNupHi/VTlJNkRyJxm4+0ryelsuzgS6DJ6IAHyxfy+D2HH56SYKh6pLchgeycMtyOQE9pLq/yqInM5c0ISgF/Pr7H6hiUJo9jZRY+HVHTdwhxWlZfEKjMnscOpE9gvU8awffEj7A5kHh9vf5fs9bfGSb1DYVt+Cw8mjWXnlswMWvrpeVmwI/go7BCODFcgTVsBj3z7/SwLKgCeMbN60QP37oPu1MFOIAoiSSAbPPLt94MX8LoEE+BZK29Qljw+YPENsEUoT41nO6MHMg8FLiMrgwlQbvaFf5r0CDu3dFbAb/3e+OEUvhyU6QrAd4ZMveiPcUNZ/eJc3fJP5qexH2IHU/By0VdPgNVmXqw4egA7NTdTt3w8BCyOGUCBy8fzegKUi/zdPz0/i+2KHURhy8nh/wlgdvO/M2YQHOvntCi//sk8tiduGAUtN/21AqwSeciHJ3IoYOlZpRVgq9EX2DV2cNOhXcudvnQKVw22agU4ZfQFDiXH6X77SyaOonDV4FSTAPCPbmZe4ITORR6czEHBKkU3FCDa8OZ/zCDdkz4HEqMpVLWIRgEKzFzs0TvVK3j6FmE/BRH8goihP6zKndpy8z+TNv8KsgEF2Gb0D2ueSG8hQOm0cRSoemxDAcqM/qHevL79k6IoUAUvDKEAtUb/sGFpy+N/OvOnJLURRpdxwfP7esf/dNFHSS5FGJ0Ni9/05uWfXZxLYarJ1Qgzt33hXH2tAEezEylMNamL4HPGDf0hXuzxz/jF+f70+6/u/QIowG6zE0FsmrNPOMduFGALBeFZtpieCka4gtUoQCoF4VlS/Ys8UhjepA8KEOlTY9UvQizYeaR/RlAJBeI5SrRTwgopEM9RqBVgGAXiOYY1vzGkmkLxDNV6dwatp2A8w3o9AaIoGM8QpSdAGzOTQwj1JoFg14HWB9hAAbl/ImiwBSJiKSDXExtMADwreIxCci3YbWRrq4TlUVCuJS+UZeJwldCjFJbrwE7bhrpSaA4F5jpywrZWMBF2Kn1G1grmEmRTcK4h28xy8XhEUEHhKU+FL8hzFFt7YEQmBag8mVaeGNLGzN3DhDx3/2pP+1p5aNQ5ClM5sLOeoh4bN50CVY7poh8cuYlCVYZNdjw5tCOdG1DmmL+jXc8OHgpco5ClBbsZavfTw1dQ0NKywonHx+OhYRGFLR1FrR3yCRFAc62A7iqW6C7fQOf6bRGAS4BP3PqSwg872MHNZns0LYDmGYM7qISwgdm3t9KhJQG4BJ2BPVSG42Dmna32Z1kALgGuOH6ASnEMzLqbiO6ECMAluA34mcqxnf2YtajehAnAJegCfEcl2cbXIjb7tgmgOTrYTGUJ5x2gnei+hAugmU20kUoTxlo7erJNAFHPIiaaHmy9wM6ObBWAS5AP3KAyDXMZSLa7H9sF4BJM4wOiYkOjEYh2ohtHBOASxAAXqNxWOQH0c6oXxwTgEgzwmXhGoYcoDWUen7ICcAnupZlFumwHbnW6D8cF0Jw13Eel/8f7Vq7oKScAl6ATP7Pl+QWbzEzkUF4ALsFNHp5d9A+wLJz5h10AzRSzVzxWPj6nKSPc2UshgEaE5fxb4fby/wDGyZK7NAJolqe57vIl2gbKlLlUAnAJJvvcuXx9OXC3bHlLJ4Bm1dJGF5W/E+guY9ZSCsAl6AecdEH5H1mduOlJAbgEvYDDCpe/MdjqHCRAaBJ095l8tmGYj/FXyp6tEgJwCToAnyl0g2auCrkqI4DmdrS3JS//IjBRlUyVEkAjwjpJy68zems2CWBegiWSnTX8FeitYpZKCsAlyJJksYq9Im/UIAGMSZDAf3fDVf7nRpZjIQHskWA4UB+G8t8ye08+CSBeAnz+cbWD5a9yQ26uEYBLcBefVGln8Xh/Q75bMnOVAFyCroDPpvLxCuUUN+XlOgE0q5Z8LLj8BmCU27JypQCam1PfFFR+Fe5juDEn1wqgEWGNxfJxwYsebs7I1QJwCebzu2yNlv+N6MUYSIDwSZAGXDFQ/rs4Zd0L2XhCAC7BeODPEMov9EomnhKASzAEOBNkMYaFXsrDcwJwCe73tXw8Lq5dkOK1LDwpAJfgDs2Sdudx7QIv5uBZATRL2r3n5GIMJABBAhAkAEECECQAIQX/AkgX5xjOJOwJAAAAAElFTkSuQmCC', 'imagehereyo.png');
                    api.images.upload(formData);
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

        describe('api.themes', function () {
            it('has an upload method', function () {
                const api = new GhostAdminAPI(config);
                should.equal(typeof api.themes.upload, 'function');
            });

            it('has an activate method', function () {
                const api = new GhostAdminAPI(config);
                should.equal(typeof api.themes.upload, 'function');
            });

            describe('api.themes.upload', function () {
                let zipPath;

                before(function () {
                    zipPath = path.join(__dirname, '../fixtures/theme.zip');
                });

                describe('expected data format', function () {
                    it('errors if passed no data', function (done) {
                        const api = new GhostAdminAPI(config);

                        api.themes
                            .upload()
                            .then(() => {
                                done(new Error('Expected an error'));
                            })
                            .catch((err) => {
                                should.exist(err);
                                err.should.match(/Missing/);
                                done();
                            });
                    });

                    it('errors for invalid object', function (done) {
                        const api = new GhostAdminAPI(config);

                        api.themes
                            .upload({})
                            .then(() => {
                                done(new Error('Expected an error'));
                            })
                            .catch((err) => {
                                should.exist(err);
                                err.should.match(/FormData/);
                                done();
                            });
                    });

                    it('should pass with FormData present', function (done) {
                        const api = new GhostAdminAPI(config);

                        api.themes
                            .upload(new FormData)
                            .then(() => done())
                            .catch(done);
                    });

                    it('should pass with data.file present', function (done) {
                        const api = new GhostAdminAPI(config);

                        api.themes
                            .upload({file: zipPath})
                            .then(() => done())
                            .catch(done);
                    });
                });
            });

            describe('api.themes.activate', function () {
                describe('expected name format', function () {
                    it('expects name to be passed in', function (done) {
                        const api = new GhostAdminAPI(config);

                        api.themes.activate().catch((err) => {
                            should.exist(err);
                            done();
                        });
                    });

                    it('should pass with name present', function (done) {
                        const api = new GhostAdminAPI(config);

                        api.themes
                            .activate('theme')
                            .then(() => done())
                            .catch(done);
                    });
                });
            });
        });
    });

    describe('api.config.read', function () {
        it('makes a GET request to the config endpoint', function (done) {
            const api = new GhostAdminAPI(config);

            server.once('url', ({pathname}) => {
                should.equal(pathname, `/ghost/api/${API_VERSION}/admin/config/`);
                done();
            });

            api.config.read();
        });
    });
});

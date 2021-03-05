// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../utils');
const should = require('should');

const {getInstance} = require('../utils/ghost-server-mock');
const GhostAdminAPI = require('../../lib');

describe('GhostAdminAPI v4', function () {
    const API_VERSION = 'v4';
    const config = {
        // url: `http://localhost:2368`,    // NOTE: comment out to run the test against local version, remember to remove "before" clauses and changes the key below
        version: API_VERSION,
        key: '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0'
    };
    let server;

    before(function (done) {
        server = getInstance(config, (serverURL) => {
            config.url = serverURL;
            done();
        });
    });

    after(function () {
        server.close();
    });

    it('works', function (done) {
        const api = new GhostAdminAPI(config);

        server.once('url', ({pathname}) => {
            should.equal(pathname, `/ghost/api/${API_VERSION}/admin/posts/`);
            done();
        });

        api.posts.browse();
    });
});

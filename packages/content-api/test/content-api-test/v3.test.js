// Switch these lines once there are useful utils
// const testUtils = require('./utils');

const should = require('should');

const {getInstance} = require('../utils/ghost-server-mock');
const GhostContentApi = require('../../cjs/content-api');

describe('GhostContentApi v3', function () {
    let server;
    const config = {
        // url: `http://localhost:2368`, // NOTE: comment out to run the test against local version, remember to remove "before" clauses and changes the key below
        version: 'v3',
        key: '0123456789abcdef0123456789'
    };

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
        const api = new GhostContentApi(config);

        server.once('url', ({pathname}) => {
            should.equal(pathname, '/ghost/api/v3/content/posts/');
            done();
        });

        api.posts.browse();
    });
});

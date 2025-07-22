// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../utils');
const should = require('should');
const sinon = require('sinon');

const GhostAdminAPI = require('../../lib/admin-api');

describe('GhostAdminAPI v6', function () {
    it('uses unversioned URL path and correct Accept-Version header', async function () {
        const makeRequestStub = sinon.stub().returns(Promise.resolve({
            posts: []
        }));

        const api = new GhostAdminAPI({
            version: 'v6.0',
            url: 'http://ghost.local',
            key: '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0',
            makeRequest: makeRequestStub
        });

        await api.posts.browse();

        makeRequestStub.calledOnce.should.be.true();

        // v6 should use unversioned URL path (no /v6/ prefix)
        should.equal(makeRequestStub.args[0][0].url, 'http://ghost.local/ghost/api/admin/posts/');

        // v6 should send Accept-Version header as v6.0
        should.equal(makeRequestStub.args[0][0].headers['Accept-Version'], 'v6.0');
    });
});

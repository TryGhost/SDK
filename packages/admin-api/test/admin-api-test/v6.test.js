// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../utils');
const should = require('should');

const GhostAdminAPI = require('../../lib/admin-api');

describe('GhostAdminAPI v6', function () {
    const config = {
        url: 'http://ghost.local',
        key: '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0'
    };

    it('should error when v6 is specified as version', function () {
        should.throws(
            () => new GhostAdminAPI({...config, version: 'v6'}),
            Error,
            `Did not error for unsupported 'v6' version`
        );
    });
});

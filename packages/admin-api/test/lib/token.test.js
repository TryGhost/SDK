// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../utils');
const should = require('should');

const jwt = require('jsonwebtoken');
const token = require('../../lib/token');

describe('Token', function () {
    it('generates a valid token based on key and API version', function () {
        const key = 'something:secret';
        const version = 'v4';

        const result = token(key, version);
        const decoded = jwt.decode(result, {complete: true});

        should.equal(decoded.payload.aud, `/v4/admin/`);

        const secret = Buffer.from('secret', 'hex');
        jwt.verify(result, secret, {
            audience: new RegExp(`^/v4/admin/$`)
        });
    });
});

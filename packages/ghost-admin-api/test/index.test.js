const assert = require('assert');
const got = require('got');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');

const GhostAdminAPI = require('../index');
const apiHost = 'https://domain.tld';
const applicationId = 'mmm';
const applicationSecret = 'bad455';
const applicationKey = `${applicationId}:${applicationSecret}`;

describe('GhostAdminAPI', () => {
    let sandbox;
    before(() => {
        sandbox = sinon.sandbox.create();
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('exports a create function', () => {
        assert.equal(typeof GhostAdminAPI.create, 'function');
    });
    it('returns an instance of got', () => {
        const gotCreateSpy = sandbox.spy(got, 'create');
        const api = GhostAdminAPI.create({apiHost, applicationKey});

        assert.equal(api, gotCreateSpy.returnValues[0]);
    });

    it('uses the got default methods', () => {
        const gotCreateSpy = sandbox.stub(got, 'create');
        GhostAdminAPI.create({apiHost, applicationKey});

        assert.equal(gotCreateSpy.args[0][0].method, got.defaults.methods);
    });

    it('uses the default options with json:true, baseUrl:apiHost, applicationKey', () => {
        const gotCreateSpy = sandbox.stub(got, 'create');
        const gotMergeOptionsSpy = sandbox.stub(got, 'mergeOptions');

        GhostAdminAPI.create({apiHost, applicationKey});

        assert.equal(gotCreateSpy.args[0][0].options, gotMergeOptionsSpy.returnValues[0]);
        assert.deepEqual(gotMergeOptionsSpy.args[0][0], got.defaults.options);
        assert.deepEqual(gotMergeOptionsSpy.args[0][1], {
            json: true,
            baseUrl: apiHost,
            applicationKey
        });
    });

    it('uses a handler which sets the authorization header using getToken and calls next', () => {
        const gotCreateSpy = sandbox.stub(got, 'create');
        GhostAdminAPI.create({apiHost, applicationKey});
        const handler = gotCreateSpy.args[0][0].handler;

        handler({headers: {}, path: '/some/resource'}, function next(options) {
            const token = options.headers.authorization.split('Bearer ')[1];
            try {
                jwt.verify(token, Buffer.from(applicationSecret, 'hex'), {
                    algorithms: ['HS256'],
                    maxAge: '5m',
                    issuer: applicationId,
                    audience: '/some/resource'
                });
            } catch (err) {
                assert.fail(err);
            }
        });
    });
});

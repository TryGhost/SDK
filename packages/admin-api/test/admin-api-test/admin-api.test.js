// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../utils');
const should = require('should');

const GhostAdminAPI = require('../../lib');

describe('GhostAdminAPI general', function () {
    const config = {
        version: 'v4',
        url: `http://ghost.local`,
        key: '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0'
    };

    it('Requires a config object with host, version and key', function () {
        should.throws(
            () => new GhostAdminAPI(),
            Error,
            'Missing config object'
        );
        should.throws(
            () => new GhostAdminAPI({url: config.url, version: config.version}),
            Error,
            'Missing config.key property'
        );

        should.throws(
            () => new GhostAdminAPI({version: config.version, key: config.key}),
            Error,
            'Missing config.url property'
        );

        should.throws(
            () => new GhostAdminAPI({url: config.url, key: config.key}),
            Error,
            'Missing config.version property'
        );

        should.doesNotThrow(
            () => new GhostAdminAPI({url: config.url, version: config.version, key: config.key}),
            Error,
            'Correct config properties'
        );
        should.doesNotThrow(
            () => new GhostAdminAPI(config),
            Error,
            'Correct config object'
        );
    });

    it('Requires correct key format in config object', function () {
        should.throws(
            () => new GhostAdminAPI({key: 'badkey', url: config.url, version: config.version}),
            Error,
            'Invalid config.key property'
        );
    });

    it('Allows makeRequest override', function () {
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

    describe('api.webhooks API', function () {
        it('webhook exposes only add, delete, and edit methods', function () {
            const api = new GhostAdminAPI(config);
            should.deepEqual(Object.keys(api.webhooks), ['add', 'edit', 'delete']);
        });
    });
});

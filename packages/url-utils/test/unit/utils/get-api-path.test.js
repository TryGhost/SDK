// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const getApiPath = require('../../../lib/utils/get-api-path');

describe('utils: getApiPath()', function () {
    let apiVersions;

    this.beforeEach(function () {
        apiVersions = {
            all: ['v0.1', 'v2', 'canary'],
            canary: {
                admin: 'canary/admin',
                content: 'canary/content',
                members: 'canary/members'
            },
            v2: {
                admin: 'v2/admin',
                content: 'v2/content',
                members: 'v2/members'
            },
            'v0.1': {
                admin: 'v0.1',
                content: 'v0.1'
            }
        };
    });

    it('prefixes base path to api version', function () {
        getApiPath({version: 'v0.1', type: 'admin', baseApiPath: '/ghost/api', apiVersions}).should.eql('/ghost/api/v0.1/', 'v0.1 admin');
        getApiPath({version: 'v0.1', type: 'content', baseApiPath: '/ghost/api', apiVersions}).should.eql('/ghost/api/v0.1/', 'v0.1 content');

        getApiPath({version: 'v2', type: 'admin', baseApiPath: '/ghost/api', apiVersions}).should.eql('/ghost/api/v2/admin/', 'v2 admin');
        getApiPath({version: 'v2', type: 'content', baseApiPath: '/ghost/api', apiVersions}).should.eql('/ghost/api/v2/content/', 'v2 content');
        getApiPath({version: 'v2', type: 'members', baseApiPath: '/ghost/api', apiVersions}).should.eql('/ghost/api/v2/members/', 'v2 members');

        getApiPath({version: 'canary', type: 'admin', baseApiPath: '/ghost/api', apiVersions}).should.eql('/ghost/api/canary/admin/', 'canary admin');
        getApiPath({version: 'canary', type: 'content', baseApiPath: '/ghost/api', apiVersions}).should.eql('/ghost/api/canary/content/', 'canary content');
        getApiPath({version: 'canary', type: 'members', baseApiPath: '/ghost/api', apiVersions}).should.eql('/ghost/api/canary/members/', 'canary members');
    });

    it('handles trailing slash in options.baseApiPath');
});

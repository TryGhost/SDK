// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const getApiPath = require('../../../lib/utils/get-api-path');

describe('utils: getApiPath()', function () {
    // these come from Ghost - refs https://github.com/TryGhost/Ghost/blob/f09216efdef0141682c085081f9eaacabd79d17c/core/shared/config/overrides.json#L63-L82
    const apiVersions = {
        all: ['v2', 'v3', 'v4', 'canary'],
        canary: {
            admin: 'admin',
            content: 'content'
        },
        v4: {
            admin: 'v4/admin',
            content: 'v4/content'
        },
        v3: {
            admin: 'v3/admin',
            content: 'v3/content'
        },
        v2: {
            admin: 'v2/admin',
            content: 'v2/content'
        }
    };

    it('prefixes base path to api version', function () {
        getApiPath({version: 'v2', type: 'admin', baseApiPath: '/ghost/api', apiVersions}).should.eql('/ghost/api/v2/admin/', 'v2 admin');
        getApiPath({version: 'v2', type: 'content', baseApiPath: '/ghost/api', apiVersions}).should.eql('/ghost/api/v2/content/', 'v2 content');

        getApiPath({version: 'v3', type: 'admin', baseApiPath: '/ghost/api', apiVersions}).should.eql('/ghost/api/v3/admin/', 'v3 admin');
        getApiPath({version: 'v3', type: 'content', baseApiPath: '/ghost/api', apiVersions}).should.eql('/ghost/api/v3/content/', 'v3 content');

        getApiPath({version: 'v4', type: 'admin', baseApiPath: '/ghost/api', apiVersions}).should.eql('/ghost/api/v4/admin/', 'v4 admin');
        getApiPath({version: 'v4', type: 'content', baseApiPath: '/ghost/api', apiVersions}).should.eql('/ghost/api/v4/content/', 'v4 content');

        getApiPath({version: 'canary', type: 'admin', baseApiPath: '/ghost/api', apiVersions}).should.eql('/ghost/api/admin/', 'canary admin');
        getApiPath({version: 'canary', type: 'content', baseApiPath: '/ghost/api', apiVersions}).should.eql('/ghost/api/content/', 'canary content');
    });

    it('handles trailing slash in options.baseApiPath', function () {
        // TODO: implement me
    });
});

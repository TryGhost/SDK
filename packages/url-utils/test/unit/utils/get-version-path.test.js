// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const getVersionPath = require('../../../lib/utils/get-version-path');

describe('utils: getVersionPath()', function () {
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

    it('returns correct versions', function () {
        getVersionPath({version: 'v0.1', type: 'admin', apiVersions}).should.eql('/v0.1/', 'v0.1 admin');
        getVersionPath({version: 'v0.1', type: 'content', apiVersions}).should.eql('/v0.1/', 'v0.1 content');

        getVersionPath({version: 'v2', type: 'admin', apiVersions}).should.eql('/v2/admin/', 'v2 admin');
        getVersionPath({version: 'v2', type: 'content', apiVersions}).should.eql('/v2/content/', 'v2 content');
        getVersionPath({version: 'v2', type: 'members', apiVersions}).should.eql('/v2/members/', 'v2 members');

        getVersionPath({version: 'canary', type: 'admin', apiVersions}).should.eql('/canary/admin/', 'canary admin');
        getVersionPath({version: 'canary', type: 'content', apiVersions}).should.eql('/canary/content/', 'canary content');
        getVersionPath({version: 'canary', type: 'members', apiVersions}).should.eql('/canary/members/', 'canary members');
    });

    it('handles aliased versions', function () {
        apiVersions.alias = 'v2';

        getVersionPath({version: 'alias', type: 'admin', apiVersions}).should.eql('/v2/admin/', 'alias admin');
        getVersionPath({version: 'alias', type: 'content', apiVersions}).should.eql('/v2/content/', 'alias content');
        getVersionPath({version: 'alias', type: 'members', apiVersions}).should.eql('/v2/members/', 'alias members');
    });

    it('throws error for unknown api version');
});

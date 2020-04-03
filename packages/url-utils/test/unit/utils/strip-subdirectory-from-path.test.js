// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const stripSubdirectoryFromPath = require('../../../lib/utils/strip-subdirectory-from-path');

describe('utils: stripSubdomainFromPath()', function () {
    it('ignores rootUrl with no subdirectory', function () {
        let path = '/my/path.png';

        stripSubdirectoryFromPath(path, 'https://example.com')
            .should.eql('/my/path.png', 'without root trailing-slash');

        stripSubdirectoryFromPath(path, 'https://example.com/')
            .should.eql('/my/path.png', 'with root trailing-slash');
    });

    it('strips single directory', function () {
        let path = '/subdir/my/path.png';

        stripSubdirectoryFromPath(path, 'https://example.com/subdir')
            .should.eql('/my/path.png', 'without root trailing-slash');

        stripSubdirectoryFromPath(path, 'https://example.com/subdir/')
            .should.eql('/my/path.png', 'without root trailing-slash');
    });

    it('strips multiple directories', function () {
        let path = '/my/subdir/my/path.png';

        stripSubdirectoryFromPath(path, 'https://example.com/my/subdir')
            .should.eql('/my/path.png', 'without root trailing-slash');

        stripSubdirectoryFromPath(path, 'https://example.com/my/subdir/')
            .should.eql('/my/path.png', 'without root trailing-slash');
    });
});

// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const stripSubdirectoryFromPath = require('../../../lib/utils/strip-subdirectory-from-path').default;

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

    it('returns path as-is when path does not start with subdirectory', function () {
        let path = '/other/path.png';

        stripSubdirectoryFromPath(path, 'https://example.com/subdir')
            .should.eql('/other/path.png', 'path does not match subdirectory');

        stripSubdirectoryFromPath(path, 'https://example.com/subdir/')
            .should.eql('/other/path.png', 'path does not match subdirectory');
    });

    it('handles invalid rootUrl gracefully', function () {
        let path = '/my/path.png';

        stripSubdirectoryFromPath(path, 'not a valid url')
            .should.eql('/my/path.png', 'invalid rootUrl returns path as-is');

        stripSubdirectoryFromPath(path, '')
            .should.eql('/my/path.png', 'empty rootUrl returns path as-is');
    });
});

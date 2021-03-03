// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const transformReadyToRelative = require('../../../lib/utils/transform-ready-to-relative');

describe('utils: transformReadyToRelative()', function () {
    it('returns relative url using default replacementStr', function () {
        let url = '__GHOST_URL__/my/file.png';
        let root = 'https://example.com';

        transformReadyToRelative(url, root)
            .should.equal('/my/file.png');
    });

    it('returns relative url using custom replacementStr', function () {
        let url = '__CUSTOM__/my/file.png';
        let root = 'https://example.com';

        transformReadyToRelative(url, root, {replacementStr: '__CUSTOM__'})
            .should.equal('/my/file.png');
    });

    it('avoids double slashes with trailing-slash in root url', function () {
        let url = '__GHOST_URL__/my/file.png';
        let root = 'https://example.com/';

        transformReadyToRelative(url, root)
            .should.equal('/my/file.png');
    });

    it('works with subdirectories in root url', function () {
        let url = '__GHOST_URL__/my/file.png';
        let root = 'https://example.com/subdir/';

        transformReadyToRelative(url, root)
            .should.equal('/subdir/my/file.png');
    });

    it('deduplicates subdirectory if included in path and root', function () {
        let url = '__GHOST_URL__/subdir/my/file.png';
        let root = 'https://example.com/subdir/';

        transformReadyToRelative(url, root)
            .should.equal('/subdir/my/file.png');
    });

    it('returns url as-is with no matching replacementStr', function () {
        let url = 'https://not-transform-ready.com/my/file.png';
        let root = 'https://example.com';

        transformReadyToRelative(url, root)
            .should.equal('https://not-transform-ready.com/my/file.png');
    });
});

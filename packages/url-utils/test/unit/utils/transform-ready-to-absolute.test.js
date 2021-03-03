// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const transformReadyToAbsolute = require('../../../lib/utils/transform-ready-to-absolute');

describe('utils: transformReadyToAbsolute()', function () {
    it('returns absolute url using default replacementStr', function () {
        let url = '__GHOST_URL__/my/file.png';
        let root = 'https://example.com';

        transformReadyToAbsolute(url, root)
            .should.equal('https://example.com/my/file.png');
    });

    it('returns absolute url using custom replacementStr', function () {
        let url = '__CUSTOM__/my/file.png';
        let root = 'https://example.com';

        transformReadyToAbsolute(url, root, {replacementStr: '__CUSTOM__'})
            .should.equal('https://example.com/my/file.png');
    });

    it('avoids double slashes with trailing-slash in root url', function () {
        let url = '__GHOST_URL__/my/file.png';
        let root = 'https://example.com/';

        transformReadyToAbsolute(url, root)
            .should.equal('https://example.com/my/file.png');
    });

    it('works with subdirectories in root url', function () {
        let url = '__GHOST_URL__/my/file.png';
        let root = 'https://example.com/subdir/';

        transformReadyToAbsolute(url, root)
            .should.equal('https://example.com/subdir/my/file.png');
    });

    it('deduplicates subdirectory if included in path and root', function () {
        let url = '__GHOST_URL__/subdir/my/file.png';
        let root = 'https://example.com/subdir/';

        transformReadyToAbsolute(url, root)
            .should.equal('https://example.com/subdir/my/file.png');
    });

    it('returns url as-is with no matching replacementStr', function () {
        let url = 'https://not-transform-ready.com/my/file.png';
        let root = 'https://example.com';

        transformReadyToAbsolute(url, root)
            .should.equal('https://not-transform-ready.com/my/file.png');
    });
});

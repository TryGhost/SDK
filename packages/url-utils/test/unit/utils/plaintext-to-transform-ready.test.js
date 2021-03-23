// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const plaintextToTransformReady = require('../../../lib/utils/plaintext-to-transform-ready');

describe('utils: plaintextToTransformReady', function () {
    it('works', function () {
        const siteUrl = 'http://my-ghost-blog.com';
        const plaintext = 'Relative link [/first-link] and Absolute link [http://my-ghost-blog.com/second-link]';

        plaintextToTransformReady(plaintext, siteUrl)
            .should.equal('First Link [__GHOST_URL__first-link] and Second Link [__GHOST_URL__second-link]');
    });

    it('works with subdirectories', function () {
        const siteUrl = 'http://my-ghost-blog.com/subdir/';
        const plaintext = 'Relative Link [/subdir/first-link], Absolute Link [http://my-ghost-blog.com/subdir/second-link], and Root-relative [http://my-ghost-blog-com/other/]';

        plaintextToTransformReady(plaintext, siteUrl)
            .should.equal('Relative Link [__GHOST_URL__/first-link], Absolute Link [__GHOST_URL__/second-link], and Root-relative [http://my-ghost-blog-com/other/]');
    });
});

// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const plaintextToTransformReady = require('../../../cjs/utils/plaintext-to-transform-ready');

describe('utils: plaintextToTransformReady', function () {
    it('works', function () {
        const siteUrl = 'http://my-ghost-blog.com';
        const plaintext = 'Relative link [/first-link] and Absolute link [http://my-ghost-blog.com/second-link]';

        plaintextToTransformReady(plaintext, siteUrl)
            .should.equal('Relative link [__GHOST_URL__/first-link] and Absolute link [__GHOST_URL__/second-link]');
    });

    it('works with subdirectories', function () {
        const siteUrl = 'http://my-ghost-blog.com/subdir/';
        const plaintext = 'Relative Link [/subdir/first-link], Absolute Link [http://my-ghost-blog.com/subdir/second-link], and Root-relative [http://my-ghost-blog-com/other/]';

        plaintextToTransformReady(plaintext, siteUrl)
            .should.equal('Relative Link [__GHOST_URL__/first-link], Absolute Link [__GHOST_URL__/second-link], and Root-relative [http://my-ghost-blog-com/other/]');
    });

    it('handles options when itemPath is an object', function () {
        const siteUrl = 'http://my-ghost-blog.com';
        const plaintext = 'Relative link [/first-link]';
        const optionsAsItemPath = {
            staticImageUrlPrefix: 'content/images'
        };
        const result = plaintextToTransformReady(plaintext, siteUrl, optionsAsItemPath);

        result.should.equal('Relative link [__GHOST_URL__/first-link]');
    });

    it('handles options when itemPath is an object and options is null', function () {
        const siteUrl = 'http://my-ghost-blog.com';
        const plaintext = 'Relative link [/first-link]';
        const optionsAsItemPath = {
            staticImageUrlPrefix: 'content/images'
        };
        const result = plaintextToTransformReady(plaintext, siteUrl, optionsAsItemPath, null);

        result.should.equal('Relative link [__GHOST_URL__/first-link]');
    });
});

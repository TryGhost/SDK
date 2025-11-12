// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const plaintextAbsoluteToTransformReady = require('../../../src/utils/plaintext-absolute-to-transform-ready');

describe('utils: plaintextAbsoluteToTransformReady', function () {
    it('works', function () {
        const siteUrl = 'http://my-ghost-blog.com';
        const plaintext = 'Standard Link [http://my-ghost-blog.com/standard-link], Different Protocol [https://my-ghost-blog.com/second-link], and Different Domain [https://ghost.org]';

        plaintextAbsoluteToTransformReady(plaintext, siteUrl)
            .should.equal('Standard Link [__GHOST_URL__/standard-link], Different Protocol [__GHOST_URL__/second-link], and Different Domain [https://ghost.org]');
    });

    it('works with subdirectories', function () {
        const siteUrl = 'http://my-ghost-blog.com/subdir/';
        const plaintext = 'Standard Link [http://my-ghost-blog.com/subdir/standard-link], Different Protocol [https://my-ghost-blog.com/subdir/second-link], Root-relative [http://my-ghost-blog.com/], and Different Domain [https://ghost.org]';

        plaintextAbsoluteToTransformReady(plaintext, siteUrl)
            .should.equal('Standard Link [__GHOST_URL__/standard-link], Different Protocol [__GHOST_URL__/second-link], Root-relative [http://my-ghost-blog.com/], and Different Domain [https://ghost.org]');
    });

    it('handles options when itemPath is an object', function () {
        const siteUrl = 'http://my-ghost-blog.com';
        const plaintext = 'Standard Link [http://my-ghost-blog.com/standard-link]';
        const optionsAsItemPath = {
            staticImageUrlPrefix: 'content/images'
        };
        const result = plaintextAbsoluteToTransformReady(plaintext, siteUrl, optionsAsItemPath);

        result.should.equal('Standard Link [__GHOST_URL__/standard-link]');
    });

    it('handles options when itemPath is an object and options is null', function () {
        const siteUrl = 'http://my-ghost-blog.com';
        const plaintext = 'Standard Link [http://my-ghost-blog.com/standard-link]';
        const optionsAsItemPath = {
            staticImageUrlPrefix: 'content/images'
        };
        const result = plaintextAbsoluteToTransformReady(plaintext, siteUrl, optionsAsItemPath, null);

        result.should.equal('Standard Link [__GHOST_URL__/standard-link]');
    });

    it('handles itemPath parameter', function () {
        const siteUrl = 'http://my-ghost-blog.com';
        const plaintext = 'Standard Link [http://my-ghost-blog.com/standard-link]';
        const itemPath = '/my-post';
        const options = {
            staticImageUrlPrefix: 'content/images'
        };
        const result = plaintextAbsoluteToTransformReady(plaintext, siteUrl, itemPath, options);

        result.should.equal('Standard Link [__GHOST_URL__/standard-link]');
    });
});

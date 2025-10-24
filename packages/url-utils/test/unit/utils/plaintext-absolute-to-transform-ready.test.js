// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const plaintextAbsoluteToTransformReady = require('../../../lib/utils/plaintext-absolute-to-transform-ready').default;

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
});

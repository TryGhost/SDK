// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const plaintextRelativeToTransformReady = require('../../../lib/utils/plaintext-relative-to-transform-ready');

describe('utils: plaintextRelativeToTransformReady', function () {
    it('works', function () {
        const siteUrl = 'http://my-ghost-blog.com';
        const plaintext = 'First Link [/first-link] and Second Link [/second-link]';

        plaintextRelativeToTransformReady(plaintext, siteUrl)
            .should.equal('First Link [__GHOST_URL__/first-link] and Second Link [__GHOST_URL__/second-link]');
    });

    it('works with subdirectories', function () {
        const siteUrl = 'http://my-ghost-blog.com/subdir/';
        const plaintext = 'First Link [/subdir/first-link] and Second Link [/second-link]';

        plaintextRelativeToTransformReady(plaintext, siteUrl)
            .should.equal('First Link [__GHOST_URL__/first-link] and Second Link [/second-link]');
    });
});

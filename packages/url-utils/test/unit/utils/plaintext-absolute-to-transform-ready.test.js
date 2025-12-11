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

    describe('cdn asset bases', function () {
        const siteUrl = 'http://my-ghost-blog.com';
        const imagesCdn = 'https://cdn.ghost.io/images';
        const mediaCdn = 'https://cdn.ghost.io/media';
        const filesCdn = 'https://cdn.ghost.io/files';

        it('converts image CDN URLs to transform-ready format', function () {
            const plaintext = `Photo link [${imagesCdn}/content/images/photo.jpg]`;
            const result = plaintextAbsoluteToTransformReady(plaintext, siteUrl, {
                staticImageUrlPrefix: 'content/images',
                imageBaseUrl: imagesCdn
            });

            result.should.equal('Photo link [__GHOST_URL__/content/images/photo.jpg]');
        });

        it('converts media CDN URLs to transform-ready format', function () {
            const plaintext = `Video link [${mediaCdn}/content/media/video.mp4]`;
            const result = plaintextAbsoluteToTransformReady(plaintext, siteUrl, {
                staticMediaUrlPrefix: 'content/media',
                mediaBaseUrl: mediaCdn
            });

            result.should.equal('Video link [__GHOST_URL__/content/media/video.mp4]');
        });

        it('converts files CDN URLs to transform-ready format', function () {
            const plaintext = `PDF link [${filesCdn}/content/files/doc.pdf]`;
            const result = plaintextAbsoluteToTransformReady(plaintext, siteUrl, {
                staticFilesUrlPrefix: 'content/files',
                filesBaseUrl: filesCdn
            });

            result.should.equal('PDF link [__GHOST_URL__/content/files/doc.pdf]');
        });

        it('converts all three CDN types in same plaintext', function () {
            const plaintext = `
Image [${imagesCdn}/content/images/photo.jpg]
Video [${mediaCdn}/content/media/video.mp4]
PDF [${filesCdn}/content/files/doc.pdf]
            `;
            const result = plaintextAbsoluteToTransformReady(plaintext, siteUrl, {
                staticImageUrlPrefix: 'content/images',
                staticMediaUrlPrefix: 'content/media',
                staticFilesUrlPrefix: 'content/files',
                imageBaseUrl: imagesCdn,
                mediaBaseUrl: mediaCdn,
                filesBaseUrl: filesCdn
            });

            result.should.containEql('[__GHOST_URL__/content/images/photo.jpg]');
            result.should.containEql('[__GHOST_URL__/content/media/video.mp4]');
            result.should.containEql('[__GHOST_URL__/content/files/doc.pdf]');
        });

        it('converts CDN URLs when mixed with site URLs', function () {
            const plaintext = `Site [${siteUrl}/page] and CDN [${imagesCdn}/content/images/photo.jpg]`;
            const result = plaintextAbsoluteToTransformReady(plaintext, siteUrl, {
                staticImageUrlPrefix: 'content/images',
                imageBaseUrl: imagesCdn
            });

            result.should.equal('Site [__GHOST_URL__/page] and CDN [__GHOST_URL__/content/images/photo.jpg]');
        });

        it('does not convert URLs from different CDN domains', function () {
            const plaintext = 'Photo [https://other-cdn.com/content/images/photo.jpg]';
            const result = plaintextAbsoluteToTransformReady(plaintext, siteUrl, {
                staticImageUrlPrefix: 'content/images',
                imageBaseUrl: imagesCdn
            });

            result.should.equal('Photo [https://other-cdn.com/content/images/photo.jpg]');
        });

        it('CRITICAL: transforms plaintext with ONLY CDN URLs (no site URLs)', function () {
            // This test will FAIL because the current implementation only builds
            // a regex for the site URL hostname, not CDN URLs.
            // When this test fails, it proves the bug exists.
            const plaintext = `Photo [${imagesCdn}/content/images/photo.jpg]`;
            const result = plaintextAbsoluteToTransformReady(plaintext, siteUrl, {
                staticImageUrlPrefix: 'content/images',
                imageBaseUrl: imagesCdn
            });

            result.should.equal('Photo [__GHOST_URL__/content/images/photo.jpg]');
        });

        it('handles CDN base URL with subdirectory', function () {
            const cdnWithSubdir = 'https://cdn.ghost.io/customer-abc123';
            const plaintext = `Photo [${cdnWithSubdir}/content/images/photo.jpg] and wrong [https://cdn.ghost.io/content/images/photo.jpg]`;
            const result = plaintextAbsoluteToTransformReady(plaintext, siteUrl, {
                staticImageUrlPrefix: 'content/images',
                imageBaseUrl: cdnWithSubdir
            });

            // Should match CDN URL WITH subdirectory
            result.should.containEql('[__GHOST_URL__/content/images/photo.jpg]');
            // Should NOT match CDN URL WITHOUT subdirectory
            result.should.containEql('[https://cdn.ghost.io/content/images/photo.jpg]');
        });

        it('handles query params and hash in CDN URLs', function () {
            const plaintext = `Photo [${imagesCdn}/content/images/photo.jpg?v=2#section]`;
            const result = plaintextAbsoluteToTransformReady(plaintext, siteUrl, {
                staticImageUrlPrefix: 'content/images',
                imageBaseUrl: imagesCdn
            });

            result.should.equal('Photo [__GHOST_URL__/content/images/photo.jpg?v=2#section]');
        });
    });
});

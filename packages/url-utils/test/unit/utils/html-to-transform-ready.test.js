require('../../utils');

const htmlToTransformReady = require('../../../lib/utils/html-to-transform-ready');

describe('utils: htmlToTransformReady()', function () {
    const siteUrl = 'http://my-ghost-blog.com';
    const mediaCdn = 'https://media-cdn.ghost.io/site-uuid';
    const filesCdn = 'https://files-cdn.ghost.io/site-uuid';
    const itemPath = '/my-awesome-post';
    let options;

    beforeEach(function () {
        options = {
            staticImageUrlPrefix: 'content/images',
            staticFilesUrlPrefix: 'content/files',
            staticMediaUrlPrefix: 'content/media',
            mediaBaseUrl: mediaCdn,
            filesBaseUrl: filesCdn
        };
    });

    it('converts relative HTML to transform-ready', function () {
        const html = '<a href="/about">Link</a><img src="/content/images/test.jpg">';
        const result = htmlToTransformReady(html, siteUrl, itemPath, options);

        result.should.containEql('<a href="__GHOST_URL__/about">Link</a>');
        result.should.containEql('<img src="__GHOST_URL__/content/images/test.jpg">');
    });

    it('converts relative HTML with page-relative URLs', function () {
        const html = '<a href="about">Link</a>';
        const result = htmlToTransformReady(html, siteUrl, itemPath, options);

        result.should.containEql('<a href="__GHOST_URL__/my-awesome-post/about">Link</a>');
    });

    it('handles options when itemPath is an object', function () {
        const html = '<a href="/about">Link</a>';
        const optionsAsItemPath = {
            staticImageUrlPrefix: 'content/images',
            assetsOnly: true
        };
        const result = htmlToTransformReady(html, siteUrl, optionsAsItemPath);

        result.should.containEql('<a href="/about">Link</a>');
    });

    it('handles options when itemPath is an object and options is null', function () {
        const html = '<a href="/about">Link</a>';
        const optionsAsItemPath = {
            staticImageUrlPrefix: 'content/images'
        };
        const result = htmlToTransformReady(html, siteUrl, optionsAsItemPath, null);

        result.should.containEql('<a href="__GHOST_URL__/about">Link</a>');
    });

    it('works with subdirectories', function () {
        const url = 'http://my-ghost-blog.com/blog';
        const html = '<a href="/blog/about">Link</a>';
        const result = htmlToTransformReady(html, url, 'blog/my-post', options);

        result.should.containEql('<a href="__GHOST_URL__/about">Link</a>');
    });

    it('converts media CDN URLs to transform-ready format', function () {
        const html = `<div class="kg-card kg-media-card"><video src="${mediaCdn}/content/media/2025/10/video.mp4"></video></div>`;

        const result = htmlToTransformReady(html, siteUrl, options);

        result.should.equal('<div class="kg-card kg-media-card"><video src="__GHOST_URL__/content/media/2025/10/video.mp4"></video></div>');
    });

    it('converts files CDN URLs to transform-ready format', function () {
        const html = `<div class="kg-card kg-file-card"><a href="${filesCdn}/content/files/2025/10/martin-1.jpg">Download</a></div>`;

        const result = htmlToTransformReady(html, siteUrl, options);

        result.should.equal('<div class="kg-card kg-file-card"><a href="__GHOST_URL__/content/files/2025/10/martin-1.jpg">Download</a></div>');
    });
});

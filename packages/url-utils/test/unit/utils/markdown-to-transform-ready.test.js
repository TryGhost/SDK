require('../../utils');

const markdownToTransformReady = require('../../../cjs/utils/markdown-to-transform-ready');

describe('utils: markdownToTransformReady()', function () {
    const siteUrl = 'http://my-ghost-blog.com';
    const imagesCdn = 'https://cdn.ghost.io/images';
    const mediaCdn = 'https://cdn.ghost.io/media';
    const filesCdn = 'https://cdn.ghost.io/files';
    const itemPath = '/my-awesome-post';
    let options;

    beforeEach(function () {
        options = {
            staticImageUrlPrefix: 'content/images',
            staticMediaUrlPrefix: 'content/media',
            staticFilesUrlPrefix: 'content/files',
            imageBaseUrl: imagesCdn,
            mediaBaseUrl: mediaCdn,
            filesBaseUrl: filesCdn
        };
    });

    it('converts relative markdown to transform-ready', function () {
        const markdown = 'This is a [link](/link) and this is an ![](/content/images/image.png)';
        const result = markdownToTransformReady(markdown, siteUrl, itemPath, options);

        result.should.equal('This is a [link](__GHOST_URL__/link) and this is an ![](__GHOST_URL__/content/images/image.png)');
    });

    it('converts relative markdown with HTML', function () {
        const markdown = 'Testing <a href="/link">Inline</a> with **markdown**';
        const result = markdownToTransformReady(markdown, siteUrl, itemPath, options);

        result.should.equal('Testing <a href="__GHOST_URL__/link">Inline</a> with **markdown**');
    });

    it('handles options when itemPath is an object', function () {
        const markdown = 'This is a [link](/link)';
        const optionsAsItemPath = {
            staticImageUrlPrefix: 'content/images'
        };
        const result = markdownToTransformReady(markdown, siteUrl, optionsAsItemPath);

        result.should.equal('This is a [link](__GHOST_URL__/link)');
    });

    it('handles options when itemPath is an object and options is null', function () {
        const markdown = 'This is a [link](/link)';
        const optionsAsItemPath = {
            staticImageUrlPrefix: 'content/images'
        };
        const result = markdownToTransformReady(markdown, siteUrl, optionsAsItemPath, null);

        result.should.equal('This is a [link](__GHOST_URL__/link)');
    });

    it('works with subdirectories', function () {
        const url = 'http://my-ghost-blog.com/blog';
        const markdown = 'This is a [link](/blog/link)';
        const result = markdownToTransformReady(markdown, url, 'blog/my-post', options);

        result.should.equal('This is a [link](__GHOST_URL__/link)');
    });

    it('converts image CDN URLs to transform-ready format', function () {
        const markdown = `![Photo](${imagesCdn}/content/images/photo.jpg)`;
        const result = markdownToTransformReady(markdown, siteUrl, itemPath, options);

        result.should.equal('![Photo](__GHOST_URL__/content/images/photo.jpg)');
    });

    it('converts media CDN URLs to transform-ready format', function () {
        const markdown = `[Video](${mediaCdn}/content/media/video.mp4)`;
        const result = markdownToTransformReady(markdown, siteUrl, itemPath, options);

        result.should.equal('[Video](__GHOST_URL__/content/media/video.mp4)');
    });

    it('converts files CDN URLs to transform-ready format', function () {
        const markdown = `[PDF](${filesCdn}/content/files/doc.pdf)`;
        const result = markdownToTransformReady(markdown, siteUrl, itemPath, options);

        result.should.equal('[PDF](__GHOST_URL__/content/files/doc.pdf)');
    });

    it('handles empty markdown', function () {
        const result = markdownToTransformReady('', siteUrl, itemPath, options);
        result.should.equal('');
    });
});


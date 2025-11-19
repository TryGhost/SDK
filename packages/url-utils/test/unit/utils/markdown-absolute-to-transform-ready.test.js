// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const fs = require('fs');
const path = require('path');
const rewire = require('rewire');
const sinon = require('sinon');

const remark = require('remark');
const markdownTransform = rewire('../../../cjs/utils/markdown-transform');
const markdownAbsoluteToTransformReady = rewire('../../../cjs/utils/markdown-absolute-to-transform-ready');

describe('utils: markdownAbsoluteToTransformReady()', function () {
    const siteUrl = 'http://my-ghost-blog.com';
    let options;

    beforeEach(function () {
        options = {
            staticImageUrlPrefix: 'content/images'
        };
    });

    it('works (demo post)', function () {
        const transformReadyMarkdown = fs.readFileSync(path.join(__dirname, '../../fixtures/long-markdown-transform-ready.md'), 'utf8');
        const absoluteMarkdown = fs.readFileSync(path.join(__dirname, '../../fixtures/long-markdown-absolute.md'), 'utf8');

        markdownAbsoluteToTransformReady(absoluteMarkdown, 'https://demo.ghost.io/', options)
            .should.equal(transformReadyMarkdown);
    });

    it('converts absolute URLs in markdown', function () {
        const markdown = 'This is a [link](http://my-ghost-blog.com/link) and this is an ![](http://my-ghost-blog.com/content/images/image.png)';

        markdownAbsoluteToTransformReady(markdown, siteUrl, options)
            .should.equal('This is a [link](__GHOST_URL__/link) and this is an ![](__GHOST_URL__/content/images/image.png)');
    });

    it('converts absolute URLs in HTML', function () {
        const markdown = `
Testing <a href="http://my-ghost-blog.com/link">Inline</a> with **markdown**

<p>
    And block-level <img src="http://my-ghost-blog.com/content/images/image.png">
</p>
        `;

        const result = markdownAbsoluteToTransformReady(markdown, siteUrl, options);

        result.should.equal(`
Testing <a href="__GHOST_URL__/link">Inline</a> with **markdown**

<p>
    And block-level <img src="__GHOST_URL__/content/images/image.png">
</p>
        `);
    });

    it('converts protocol relative `//` URLs', function () {
        const markdown = '![](//my-ghost-blog.com/content/images/image.png)';
        const result = markdownAbsoluteToTransformReady(markdown, siteUrl, options);

        result.should.equal('![](__GHOST_URL__/content/images/image.png)');
    });

    it('skips absolute URLS in code blocks', function () {
        const markdown = '## Testing\n\n    ![](http://my-ghost-blog.com/content/images/image.png)';
        markdownAbsoluteToTransformReady(markdown, siteUrl, options)
            .should.equal(markdown);
    });

    it('converts only asset URLs with assetsOnly=true option', function () {
        const markdown = '![](http://my-ghost-blog.com/content/images/image.png) [](http://my-ghost-blog.com/not-an-asset)';

        options.assetsOnly = true;

        markdownAbsoluteToTransformReady(markdown, siteUrl, options)
            .should.equal('![](__GHOST_URL__/content/images/image.png) [](http://my-ghost-blog.com/not-an-asset)');
    });

    it('retains whitespace layout', function () {
        const markdown = `

## Testing

    this is a code block
    `;

        const result = markdownAbsoluteToTransformReady(markdown, siteUrl, options);

        result.should.equal(`

## Testing

    this is a code block
    `);
    });

    it('retains whitespace layout inside list elements', function () {
        const markdown = '## testing\n\nmctesters\n\n- test\n- line\n- items"';
        markdownAbsoluteToTransformReady(markdown, siteUrl, options)
            .should.equal(markdown);
    });

    it('does not strip chars from end', function () {
        const markdown = '<a href="https://example.com">Test</a> <a href="https://example.com/2">Test2</a> Test';

        markdownAbsoluteToTransformReady(markdown, siteUrl, options)
            .should.equal(markdown);
    });

    it('handles linked images', function () {
        const markdown = '[![Test](http://my-ghost-blog.com/content/images/2014/01/test.jpg)](http://my-ghost-blog.com/content/images/2014/01/test.jpg)';

        const result = markdownAbsoluteToTransformReady(markdown, siteUrl, options);

        result.should.equal('[![Test](__GHOST_URL__/content/images/2014/01/test.jpg)](__GHOST_URL__/content/images/2014/01/test.jpg)');
    });

    it('handles default options when options is not provided', function () {
        const markdown = 'This is a [link](http://my-ghost-blog.com/link)';
        const result = markdownAbsoluteToTransformReady(markdown, siteUrl);

        result.should.equal('This is a [link](__GHOST_URL__/link)');
    });

    it('handles ignoreProtocol option', function () {
        const markdown = 'This is a [link](https://my-ghost-blog.com/link)';
        const testOptions = {
            ignoreProtocol: true
        };
        const result = markdownAbsoluteToTransformReady(markdown, 'http://my-ghost-blog.com', testOptions);

        result.should.equal('This is a [link](__GHOST_URL__/link)');
    });

    it('handles ignoreProtocol option set to false', function () {
        const markdown = 'This is a [link](https://my-ghost-blog.com/link)';
        const testOptions = {
            ignoreProtocol: false
        };
        const result = markdownAbsoluteToTransformReady(markdown, 'http://my-ghost-blog.com', testOptions);

        result.should.equal('This is a [link](https://my-ghost-blog.com/link)');
    });

    it('handles assetsOnly option', function () {
        const markdown = '![](http://my-ghost-blog.com/content/images/image.png) [](http://my-ghost-blog.com/not-an-asset)';
        const testOptions = {
            assetsOnly: true
        };
        const result = markdownAbsoluteToTransformReady(markdown, siteUrl, testOptions);

        result.should.equal('![](__GHOST_URL__/content/images/image.png) [](http://my-ghost-blog.com/not-an-asset)');
    });

    it('handles siteUrl with trailing slash', function () {
        const markdown = 'This is a [link](http://my-ghost-blog.com/link)';
        const result = markdownAbsoluteToTransformReady(markdown, 'http://my-ghost-blog.com/', options);

        result.should.equal('This is a [link](__GHOST_URL__/link)');
    });

    it('handles siteUrl with https protocol', function () {
        const markdown = 'This is a [link](https://my-ghost-blog.com/link)';
        const result = markdownAbsoluteToTransformReady(markdown, 'https://my-ghost-blog.com', options);

        result.should.equal('This is a [link](__GHOST_URL__/link)');
    });

    describe('cdn asset bases', function () {
        const imagesCdn = 'https://cdn.ghost.io/images';
        const mediaCdn = 'https://cdn.ghost.io/media';
        const filesCdn = 'https://cdn.ghost.io/files';

        it('converts image CDN URLs in markdown images to transform-ready format', function () {
            const markdown = `![Photo](${imagesCdn}/content/images/2025/01/photo.jpg)`;
            const result = markdownAbsoluteToTransformReady(markdown, siteUrl, {
                ...options,
                imageBaseUrl: imagesCdn
            });

            result.should.equal('![Photo](__GHOST_URL__/content/images/2025/01/photo.jpg)');
        });

        it('converts image CDN URLs in markdown links to transform-ready format', function () {
            const markdown = `[Download Image](${imagesCdn}/content/images/2025/01/photo.jpg)`;
            const result = markdownAbsoluteToTransformReady(markdown, siteUrl, {
                ...options,
                imageBaseUrl: imagesCdn
            });

            result.should.equal('[Download Image](__GHOST_URL__/content/images/2025/01/photo.jpg)');
        });

        it('converts media CDN URLs to transform-ready format', function () {
            const markdown = `[Watch Video](${mediaCdn}/content/media/2025/01/video.mp4)`;
            const result = markdownAbsoluteToTransformReady(markdown, siteUrl, {
                ...options,
                staticMediaUrlPrefix: 'content/media',
                mediaBaseUrl: mediaCdn
            });

            result.should.equal('[Watch Video](__GHOST_URL__/content/media/2025/01/video.mp4)');
        });

        it('converts files CDN URLs to transform-ready format', function () {
            const markdown = `[Download PDF](${filesCdn}/content/files/2025/01/document.pdf)`;
            const result = markdownAbsoluteToTransformReady(markdown, siteUrl, {
                ...options,
                staticFilesUrlPrefix: 'content/files',
                filesBaseUrl: filesCdn
            });

            result.should.equal('[Download PDF](__GHOST_URL__/content/files/2025/01/document.pdf)');
        });

        it('converts all three CDN types in same markdown', function () {
            const markdown = `
![Photo](${imagesCdn}/content/images/2025/01/photo.jpg)
[Watch Video](${mediaCdn}/content/media/2025/01/video.mp4)
[Download PDF](${filesCdn}/content/files/2025/01/document.pdf)
            `;
            const result = markdownAbsoluteToTransformReady(markdown, siteUrl, {
                staticImageUrlPrefix: 'content/images',
                staticMediaUrlPrefix: 'content/media',
                staticFilesUrlPrefix: 'content/files',
                imageBaseUrl: imagesCdn,
                mediaBaseUrl: mediaCdn,
                filesBaseUrl: filesCdn
            });

            result.should.containEql('![Photo](__GHOST_URL__/content/images/2025/01/photo.jpg)');
            result.should.containEql('[Watch Video](__GHOST_URL__/content/media/2025/01/video.mp4)');
            result.should.containEql('[Download PDF](__GHOST_URL__/content/files/2025/01/document.pdf)');
        });

        it('converts CDN URLs in linked images', function () {
            const markdown = `[![Photo](${imagesCdn}/content/images/photo.jpg)](${imagesCdn}/content/images/photo.jpg)`;
            const result = markdownAbsoluteToTransformReady(markdown, siteUrl, {
                ...options,
                imageBaseUrl: imagesCdn
            });

            result.should.equal('[![Photo](__GHOST_URL__/content/images/photo.jpg)](__GHOST_URL__/content/images/photo.jpg)');
        });

        it('converts CDN URLs in HTML within markdown', function () {
            const markdown = `
Testing with markdown

<img src="${imagesCdn}/content/images/photo.jpg">
<video src="${mediaCdn}/content/media/video.mp4">
            `;
            const result = markdownAbsoluteToTransformReady(markdown, siteUrl, {
                staticImageUrlPrefix: 'content/images',
                staticMediaUrlPrefix: 'content/media',
                imageBaseUrl: imagesCdn,
                mediaBaseUrl: mediaCdn
            });

            result.should.containEql('<img src="__GHOST_URL__/content/images/photo.jpg">');
            result.should.containEql('<video src="__GHOST_URL__/content/media/video.mp4">');
        });

        it('still converts site-hosted images when CDN is configured', function () {
            const markdown = `![Photo](${siteUrl}/content/images/photo.jpg)`;
            const result = markdownAbsoluteToTransformReady(markdown, siteUrl, {
                ...options,
                imageBaseUrl: imagesCdn
            });

            result.should.equal('![Photo](__GHOST_URL__/content/images/photo.jpg)');
        });

        it('does not convert URLs from different CDN domains', function () {
            const markdown = '![Photo](https://other-cdn.com/content/images/photo.jpg)';
            const result = markdownAbsoluteToTransformReady(markdown, siteUrl, {
                ...options,
                imageBaseUrl: imagesCdn
            });

            result.should.equal('![Photo](https://other-cdn.com/content/images/photo.jpg)');
        });
    });

    describe('AST parsing is skipped', function () {
        let remarkSpy, sandbox;

        beforeEach(function () {
            sandbox = sinon.createSandbox();
            remarkSpy = sinon.spy(remark);
            markdownTransform.__set__('remark', remarkSpy);
            markdownAbsoluteToTransformReady.__set__('markdownTransform', markdownTransform);
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('when markdown has no absolute URLs matching siteUrl', function () {
            const url = 'http://my-ghost-blog.com/';

            markdownAbsoluteToTransformReady('', url, options);
            remarkSpy.called.should.be.false();

            markdownAbsoluteToTransformReady('[test](#test)', url, options);
            remarkSpy.called.should.be.false();

            markdownAbsoluteToTransformReady('[test](https://example.com)', url, options);
            remarkSpy.called.should.be.false();

            markdownAbsoluteToTransformReady('[test](http://my-ghost-blog.com)', url, options);
            remarkSpy.calledOnce.should.be.true();

            // ignores protocol when ignoreProtocol: true
            markdownAbsoluteToTransformReady('[test](https://my-ghost-blog.com)', url, options);
            remarkSpy.calledTwice.should.be.true();

            // respects protocol when ignoreProtocol: false
            options.ignoreProtocol = false;
            markdownAbsoluteToTransformReady('[test](https://my-ghost-blog.com)', url, options);
            remarkSpy.calledTwice.should.be.true();
        });

        it('when markdown contains CDN URLs, parsing is NOT skipped', function () {
            const url = 'http://my-ghost-blog.com/';
            const imagesCdn = 'https://cdn.ghost.io/images';
            const mediaCdn = 'https://cdn.ghost.io/media';
            const filesCdn = 'https://cdn.ghost.io/files';

            remarkSpy.resetHistory();

            // Markdown with ONLY image CDN URL should trigger parsing
            markdownAbsoluteToTransformReady(`![Photo](${imagesCdn}/content/images/photo.jpg)`, url, {
                ...options,
                imageBaseUrl: imagesCdn
            });
            remarkSpy.calledOnce.should.be.true('image CDN URL didn\'t trigger parse');

            remarkSpy.resetHistory();

            // Markdown with ONLY media CDN URL should trigger parsing
            markdownAbsoluteToTransformReady(`[Video](${mediaCdn}/content/media/video.mp4)`, url, {
                ...options,
                staticMediaUrlPrefix: 'content/media',
                mediaBaseUrl: mediaCdn
            });
            remarkSpy.calledOnce.should.be.true('media CDN URL didn\'t trigger parse');

            remarkSpy.resetHistory();

            // Markdown with ONLY files CDN URL should trigger parsing
            markdownAbsoluteToTransformReady(`[PDF](${filesCdn}/content/files/doc.pdf)`, url, {
                ...options,
                staticFilesUrlPrefix: 'content/files',
                filesBaseUrl: filesCdn
            });
            remarkSpy.calledOnce.should.be.true('files CDN URL didn\'t trigger parse');

            remarkSpy.resetHistory();

            // Markdown with multiple CDN URLs but no site URL should trigger parsing
            markdownAbsoluteToTransformReady(`
![Photo](${imagesCdn}/content/images/photo.jpg)
[Video](${mediaCdn}/content/media/video.mp4)
            `, url, {
                staticImageUrlPrefix: 'content/images',
                staticMediaUrlPrefix: 'content/media',
                imageBaseUrl: imagesCdn,
                mediaBaseUrl: mediaCdn
            });
            remarkSpy.calledOnce.should.be.true('multiple CDN URLs didn\'t trigger parse');
        });

        it('when markdown has no matching URLs (no site or CDN), parsing is skipped', function () {
            const url = 'http://my-ghost-blog.com/';
            const imagesCdn = 'https://cdn.ghost.io/images';

            remarkSpy.resetHistory();

            // External URL with CDN configured should not trigger parsing
            markdownAbsoluteToTransformReady('[test](https://example.com)', url, {
                ...options,
                imageBaseUrl: imagesCdn
            });
            remarkSpy.called.should.be.false('external url triggered parse even with CDN configured');
        });
    });
});

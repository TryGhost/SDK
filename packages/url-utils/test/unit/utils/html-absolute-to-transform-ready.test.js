// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const rewire = require('rewire');
const sinon = require('sinon');

const cheerio = require('cheerio');
const htmlTransform = rewire('../../../lib/utils/html-transform');
const htmlAbsoluteToTransformReady = require('../../../lib/utils/html-absolute-to-transform-ready').default;

describe('utils: htmlAbsoluteToTransformReady()', function () {
    const siteUrl = 'http://my-ghost-blog.com';
    let options;

    beforeEach(function () {
        options = {
            staticImageUrlPrefix: 'content/images'
        };
    });

    it('does not convert relative URLs', function () {
        const html = '<a href="/content/images">';
        const result = htmlAbsoluteToTransformReady(html, siteUrl, options);

        result.should.containEql('<a href="/content/images">');
    });

    it('does not convert internal links starting with "#"', function () {
        const html = '<a href="#jumptosection" title="Table of Content">';
        const result = htmlAbsoluteToTransformReady(html, siteUrl, options);

        result.should.containEql('<a href="#jumptosection" title="Table of Content">');
    });

    it('converts an an absolute URL on site domain', function () {
        const html = '<a href="https://my-ghost-blog.com/about#nowhere">';
        const result = htmlAbsoluteToTransformReady(html, siteUrl, options);

        result.should.containEql('<a href="__GHOST_URL__/about#nowhere">');
    });

    it('converts protocol relative `//` URLs', function () {
        const html = '<a href="//my-ghost-blog.com/content/images">';
        const result = htmlAbsoluteToTransformReady(html, siteUrl, options);

        result.should.containEql('<a href="__GHOST_URL__/content/images">');
    });

    it('converts allowlisted data-kg-* URLs', function () {
        const html = '<figure data-kg-thumbnail="https://my-ghost-blog.com/content/images/test.jpg" data-kg-custom-thumbnail="//my-ghost-blog.com/content/images/custom.jpg" data-kg-background-image="https://my-ghost-blog.com/content/images/bg.jpg"></figure>';
        const result = htmlAbsoluteToTransformReady(html, siteUrl, options);

        result.should.eql('<figure data-kg-thumbnail="__GHOST_URL__/content/images/test.jpg" data-kg-custom-thumbnail="__GHOST_URL__/content/images/custom.jpg" data-kg-background-image="__GHOST_URL__/content/images/bg.jpg"></figure>');
    });

    it('does not convert an an absolute URL on external domain', function () {
        const html = '<a href="https://external.com/about#nowhere">';
        const result = htmlAbsoluteToTransformReady(html, siteUrl, options);

        result.should.containEql('<a href="https://external.com/about#nowhere">');
    });

    it('converts an absolute URL including site subdirectory', function () {
        const html = '<a href="https://my-ghost-blog.com/blog/about#nowhere">';
        const result = htmlAbsoluteToTransformReady(html, 'https://my-ghost-blog.com/blog', options);

        result.should.containEql('<a href="__GHOST_URL__/about#nowhere">');
    });

    it('ignores protocol of absolute URLs', function () {
        const html = '<a href="http://my-ghost-blog.com/content/images">';
        const result = htmlAbsoluteToTransformReady(html, 'https://my-ghost-blog.com/', options);

        result.should.containEql('<a href="__GHOST_URL__/content/images">');
    });

    it('only modifies asset urls with assetsOnly option set', function () {
        options.assetsOnly = true;

        let html = '<a href="https://my-ghost-blog.com/about"><img src="https://my-ghost-blog.com/content/images/1.jpg">';
        let result = htmlAbsoluteToTransformReady(html, siteUrl, options);
        result.should.containEql('<img src="__GHOST_URL__/content/images/1.jpg">');
        result.should.containEql('<a href="https://my-ghost-blog.com/about">');

        html = '<a href="https://my-ghost-blog.com/content/images/09/01/image.jpg">';
        result = htmlAbsoluteToTransformReady(html, siteUrl, options);
        result.should.containEql('<a href="__GHOST_URL__/content/images/09/01/image.jpg">');

        html = '<a href="https://my-ghost-blog.com/blog/content/images/09/01/image.jpg">';
        result = htmlAbsoluteToTransformReady(html, 'https://my-ghost-blog.com/blog/', options);
        result.should.containEql('<a href="__GHOST_URL__/content/images/09/01/image.jpg">');

        html = '<img src="http://my-ghost-blog.de/content/images/09/01/image.jpg">';
        result = htmlAbsoluteToTransformReady(html, siteUrl, options);
        result.should.containEql('<img src="http://my-ghost-blog.de/content/images/09/01/image.jpg">');

        html = '<img src="http://external.com/image.jpg">';
        result = htmlAbsoluteToTransformReady(html, siteUrl, options);
        result.should.containEql('<img src="http://external.com/image.jpg">');
    });

    it('keeps single vs double quotes for attributes', function () {
        let html = `<div data-options='{"strings": ["item1", "item2"]}'>`;
        let result = htmlAbsoluteToTransformReady(html, siteUrl, options);

        result.should.eql(`<div data-options='{"strings": ["item1", "item2"]}'>`);

        html = `<a href="https://my-ghost-blog.com/test" data-options='{"strings": ["item1", "item2"]}'>Testing</a>`;
        result = htmlAbsoluteToTransformReady(html, siteUrl, options);

        result.should.eql(`<a href="__GHOST_URL__/test" data-options='{"strings": ["item1", "item2"]}'>Testing</a>`);
    });

    it('ignores html inside <code> blocks', function () {
        let html = `<p><code><a href="https://my-ghost-blog.com/test">Test</a></p>`;
        let result = htmlAbsoluteToTransformReady(html, siteUrl, options);

        result.should.eql(`<p><code><a href="https://my-ghost-blog.com/test">Test</a></p>`);

        html = '<p><a href="https://my-ghost-blog.com/test">Test</a><code><a href="https://my-ghost-blog.com/test">Test</a></code><a href="https://my-ghost-blog.com/test">Test</a></p>';
        result = htmlAbsoluteToTransformReady(html, siteUrl, options);

        result.should.eql('<p><a href="__GHOST_URL__/test">Test</a><code><a href="https://my-ghost-blog.com/test">Test</a></code><a href="__GHOST_URL__/test">Test</a></p>');
    });

    it('keeps html indentation', function () {
        let html = `
<p>
    <a
        href="https://my-ghost-blog.com/test"
        data-test=true
    >
        Test
    </a>
</p>
`;
        let result = htmlAbsoluteToTransformReady(html, siteUrl, options);
        result.should.eql(`
<p>
    <a
        href="__GHOST_URL__/test"
        data-test=true
    >
        Test
    </a>
</p>
`);
    });

    it('skips any matching relative URLs outside of attributes', function () {
        let html = '<p><a href="http://my-ghost-blog.com/test">/test</a><code><a href="/test">/test</a></code><a href="http://my-ghost-blog.com/test">/test</a></p>';

        htmlAbsoluteToTransformReady(html, siteUrl, options)
            .should.eql('<p><a href="__GHOST_URL__/test">/test</a><code><a href="/test">/test</a></code><a href="__GHOST_URL__/test">/test</a></p>');
    });

    it('skips any matching attribute/url pairs in plain text', function () {
        let html = '<p>You can use <code>href="http://my-ghost-blog.com/relative"</code> to make links like <a href="http://my-ghost-blog.com/relative">this</a></p>';

        htmlAbsoluteToTransformReady(html, siteUrl, options)
            .should.eql('<p>You can use <code>href="http://my-ghost-blog.com/relative"</code> to make links like <a href="__GHOST_URL__/relative">this</a></p>');
    });

    it('skips <stream> elements', function () {
        let html = '<stream src="http://my-ghost-blog.com/8f6257280d40bbb240853442ebb1c361" playsinline="" autoplay="" loop="" mute="">';

        htmlAbsoluteToTransformReady(html, siteUrl, options)
            .should.eql(html);
    });

    describe('srcset support', function () {
        /* eslint-disable no-irregular-whitespace */
        it('converts multiple urls', function () {
            let html = `
                <img srcset="http://my-ghost-blog.com/content/images/elva-fairy-320w.jpg 320w,
                             http://my-ghost-blog.com/content/images/elva-fairy-480w.jpg 480w,
                             http://my-ghost-blog.com/content/images/elva-fairy-800w.jpg 800w"
                    sizes="(max-width: 320px) 280px,
                           (max-width: 480px) 440px,
                           800px"
                    src="http://my-ghost-blog.com/content/images/elva-fairy-800w.jpg" alt="Elva dressed as a fairy">
            `;

            let result = htmlAbsoluteToTransformReady(html, siteUrl, options);

            result.should.eql(`
                <img srcset="__GHOST_URL__/content/images/elva-fairy-320w.jpg 320w,
                             __GHOST_URL__/content/images/elva-fairy-480w.jpg 480w,
                             __GHOST_URL__/content/images/elva-fairy-800w.jpg 800w"
                    sizes="(max-width: 320px) 280px,
                           (max-width: 480px) 440px,
                           800px"
                    src="__GHOST_URL__/content/images/elva-fairy-800w.jpg" alt="Elva dressed as a fairy">
            `);
        });
        /* eslint-enable no-irregular-whitespace */
    });

    describe('css support', function () {
        it('converts background-image', function () {
            let html = `
                <div style="background-image: url('http://my-ghost-blog.com/content/images/elva-fairy-320w.jpg')"></div>
            `;

            let result = htmlAbsoluteToTransformReady(html, siteUrl, options);

            result.should.eql(`
                <div style="background-image: url('__GHOST_URL__/content/images/elva-fairy-320w.jpg')"></div>
            `);
        });

        it('converts background image with multiple values', function () {
            let html = `
            <div style="background: transparent url('https://ghost.local/content/images/2022/03/68omdg.png') 50% 50% cover no-repeat;">
            </div>`;

            let result = htmlAbsoluteToTransformReady(html, siteUrl, options);

            result.should.eql(`
            <div style="background: transparent url('https://ghost.local/content/images/2022/03/68omdg.png') 50% 50% cover no-repeat;">
            </div>`);
        });

        it('converts background-image with multiple urls', function () {
            let html = `
                <div style="background-image:
                        url('http://my-ghost-blog.com/content/images/elva-fairy-320w.jpg'),
                        url('http://my-ghost-blog.com/content/images/elva-fairy-480w.jpg')">
                </div>
            `;

            let result = htmlAbsoluteToTransformReady(html, siteUrl, options);

            result.should.eql(`
                <div style="background-image:
                        url('__GHOST_URL__/content/images/elva-fairy-320w.jpg'),
                        url('__GHOST_URL__/content/images/elva-fairy-480w.jpg')">
                </div>
            `);
        });
    });

    describe('cdn asset bases', function () {
        const mediaCdn = 'https://cdn.ghost.io/media';
        const filesCdn = 'https://cdn.ghost.io/files';
        const imagesCdn = 'https://cdn.ghost.io/images';

        it('converts image CDN URLs to transform-ready format', function () {
            const html = `<img src="${imagesCdn}/content/images/2025/01/photo.jpg">`;
            const result = htmlAbsoluteToTransformReady(html, siteUrl, {
                ...options,
                imageBaseUrl: imagesCdn
            });

            result.should.containEql('<img src="__GHOST_URL__/content/images/2025/01/photo.jpg">');
        });

        it('converts media CDN URLs to transform-ready format', function () {
            const html = `<video src="${mediaCdn}/content/media/2025/01/video.mp4">`;
            const result = htmlAbsoluteToTransformReady(html, siteUrl, {
                ...options,
                staticMediaUrlPrefix: 'content/media',
                mediaBaseUrl: mediaCdn
            });

            result.should.containEql('<video src="__GHOST_URL__/content/media/2025/01/video.mp4">');
        });

        it('converts files CDN URLs to transform-ready format', function () {
            const html = `<a href="${filesCdn}/content/files/2025/01/document.pdf">Download</a>`;
            const result = htmlAbsoluteToTransformReady(html, siteUrl, {
                ...options,
                staticFilesUrlPrefix: 'content/files',
                filesBaseUrl: filesCdn
            });

            result.should.containEql('<a href="__GHOST_URL__/content/files/2025/01/document.pdf">Download</a>');
        });

        it('converts all three CDN types in same HTML', function () {
            const html = `
                <img src="${imagesCdn}/content/images/2025/01/photo.jpg">
                <video src="${mediaCdn}/content/media/2025/01/video.mp4">
                <a href="${filesCdn}/content/files/2025/01/document.pdf">Download</a>
            `;
            const result = htmlAbsoluteToTransformReady(html, siteUrl, {
                staticImageUrlPrefix: 'content/images',
                staticMediaUrlPrefix: 'content/media',
                staticFilesUrlPrefix: 'content/files',
                imageBaseUrl: imagesCdn,
                mediaBaseUrl: mediaCdn,
                filesBaseUrl: filesCdn
            });

            result.should.containEql('<img src="__GHOST_URL__/content/images/2025/01/photo.jpg">');
            result.should.containEql('<video src="__GHOST_URL__/content/media/2025/01/video.mp4">');
            result.should.containEql('<a href="__GHOST_URL__/content/files/2025/01/document.pdf">Download</a>');
        });

        it('converts CDN URLs in srcset', function () {
            const html = `
                <img srcset="${imagesCdn}/content/images/photo-320w.jpg 320w,
                             ${imagesCdn}/content/images/photo-480w.jpg 480w"
                    src="${imagesCdn}/content/images/photo-800w.jpg">
            `;
            const result = htmlAbsoluteToTransformReady(html, siteUrl, {
                ...options,
                imageBaseUrl: imagesCdn
            });

            result.should.containEql('srcset="__GHOST_URL__/content/images/photo-320w.jpg 320w');
            result.should.containEql('__GHOST_URL__/content/images/photo-480w.jpg 480w"');
            result.should.containEql('src="__GHOST_URL__/content/images/photo-800w.jpg"');
        });

        it('converts CDN URLs in CSS background-image', function () {
            const html = `<div style="background-image: url('${imagesCdn}/content/images/bg.jpg')"></div>`;
            const result = htmlAbsoluteToTransformReady(html, siteUrl, {
                ...options,
                imageBaseUrl: imagesCdn
            });

            result.should.containEql('background-image: url(\'__GHOST_URL__/content/images/bg.jpg\')');
        });

        it('still converts site-hosted images when CDN is configured', function () {
            const html = `<img src="${siteUrl}/content/images/2025/01/photo.jpg">`;
            const result = htmlAbsoluteToTransformReady(html, siteUrl, {
                ...options,
                imageBaseUrl: imagesCdn
            });

            result.should.containEql('<img src="__GHOST_URL__/content/images/2025/01/photo.jpg">');
        });

        it('does not convert URLs from different CDN domains', function () {
            const html = `<img src="https://other-cdn.com/content/images/photo.jpg">`;
            const result = htmlAbsoluteToTransformReady(html, siteUrl, {
                ...options,
                imageBaseUrl: imagesCdn
            });

            result.should.containEql('<img src="https://other-cdn.com/content/images/photo.jpg">');
        });
    });

    describe('DOM parsing is skipped', function () {
        let cheerioLoadSpy, rewireRestore;

        beforeEach(function () {
            cheerioLoadSpy = sinon.spy(cheerio, 'load');
            rewireRestore = htmlTransform.__set__('cheerio', cheerio);
        });

        afterEach(function () {
            cheerioLoadSpy.restore();
            rewireRestore();
        });

        it('when html has no absolute URLs matching siteUrl', function () {
            const url = 'http://my-ghost-blog.com/';

            htmlAbsoluteToTransformReady('', url, options);
            cheerioLoadSpy.called.should.be.false('blank html triggered parse');

            htmlAbsoluteToTransformReady('<a href="#test">test</a>', url, options);
            cheerioLoadSpy.called.should.be.false('hash url triggered parse');

            htmlAbsoluteToTransformReady('<a href="https://example.com">test</a>)', url, options);
            cheerioLoadSpy.called.should.be.false('external url triggered parse');

            htmlAbsoluteToTransformReady('<a href="http://my-ghost-blog.com">test</a>)', url, options);
            cheerioLoadSpy.calledOnce.should.be.true('site url didn\'t trigger parse');

            // ignores protocol when ignoreProtocol: true
            htmlAbsoluteToTransformReady('<a href="https://my-ghost-blog.com">test</a>)', url, options);
            cheerioLoadSpy.calledTwice.should.be.true('site url with different protocol didn\'t trigger parse');

            // respects protocol when ignoreProtocol: false
            options.ignoreProtocol = false;
            htmlAbsoluteToTransformReady('<a href="https://my-ghost-blog.com">test</a>)', url, options);
            cheerioLoadSpy.calledTwice.should.be.true('site url with different protocol triggered parse when ignoreProtocol is false');
        });

        it('when html contains CDN URLs, parsing is NOT skipped', function () {
            const url = 'http://my-ghost-blog.com/';
            const imagesCdn = 'https://cdn.ghost.io/images';
            const mediaCdn = 'https://cdn.ghost.io/media';
            const filesCdn = 'https://cdn.ghost.io/files';

            cheerioLoadSpy.resetHistory();

            // HTML with ONLY image CDN URL should trigger parsing
            htmlAbsoluteToTransformReady(`<img src="${imagesCdn}/content/images/photo.jpg">`, url, {
                ...options,
                imageBaseUrl: imagesCdn
            });
            cheerioLoadSpy.calledOnce.should.be.true('image CDN URL didn\'t trigger parse');

            cheerioLoadSpy.resetHistory();

            // HTML with ONLY media CDN URL should trigger parsing
            htmlAbsoluteToTransformReady(`<video src="${mediaCdn}/content/media/video.mp4">`, url, {
                ...options,
                staticMediaUrlPrefix: 'content/media',
                mediaBaseUrl: mediaCdn
            });
            cheerioLoadSpy.calledOnce.should.be.true('media CDN URL didn\'t trigger parse');

            cheerioLoadSpy.resetHistory();

            // HTML with ONLY files CDN URL should trigger parsing
            htmlAbsoluteToTransformReady(`<a href="${filesCdn}/content/files/doc.pdf">Download</a>`, url, {
                ...options,
                staticFilesUrlPrefix: 'content/files',
                filesBaseUrl: filesCdn
            });
            cheerioLoadSpy.calledOnce.should.be.true('files CDN URL didn\'t trigger parse');

            cheerioLoadSpy.resetHistory();

            // HTML with multiple CDN URLs but no site URL should trigger parsing
            htmlAbsoluteToTransformReady(`
                <img src="${imagesCdn}/content/images/photo.jpg">
                <video src="${mediaCdn}/content/media/video.mp4">
            `, url, {
                staticImageUrlPrefix: 'content/images',
                staticMediaUrlPrefix: 'content/media',
                imageBaseUrl: imagesCdn,
                mediaBaseUrl: mediaCdn
            });
            cheerioLoadSpy.calledOnce.should.be.true('multiple CDN URLs didn\'t trigger parse');
        });

        it('when html has no matching URLs (no site or CDN), parsing is skipped', function () {
            const url = 'http://my-ghost-blog.com/';
            const imagesCdn = 'https://cdn.ghost.io/images';

            cheerioLoadSpy.resetHistory();

            // External URL with CDN configured should not trigger parsing
            htmlAbsoluteToTransformReady('<a href="https://example.com">test</a>', url, {
                ...options,
                imageBaseUrl: imagesCdn
            });
            cheerioLoadSpy.called.should.be.false('external url triggered parse even with CDN configured');
        });
    });
});

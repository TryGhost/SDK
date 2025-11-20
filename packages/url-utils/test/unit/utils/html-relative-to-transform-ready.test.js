// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const sinon = require('sinon');

const cheerio = require('cheerio');
const htmlRelativeToTransformReady = require('../../../lib/utils/html-relative-to-transform-ready').default;

describe('utils: htmlRelativeToTransformReady()', function () {
    const siteUrl = 'http://my-ghost-blog.com';
    const itemPath = '/my-awesome-post';
    let options;

    beforeEach(function () {
        options = {
            staticImageUrlPrefix: 'content/images'
        };
    });

    it('does not convert protocol relative `//` URLs', function () {
        const html = '<a href="//my-ghost-blog.com/content/images" title="Absolute URL">';
        const result = htmlRelativeToTransformReady(html, siteUrl, itemPath, options);

        result.should.containEql('<a href="//my-ghost-blog.com/content/images" title="Absolute URL">');
    });

    it('does not convert internal links starting with "#"', function () {
        const html = '<a href="#jumptosection" title="Table of Content">';
        const result = htmlRelativeToTransformReady(html, siteUrl, itemPath, options);

        result.should.containEql('<a href="#jumptosection" title="Table of Content">');
    });

    it('does not throw on invalid urls', function () {
        const html = '<a href=\\"#\\">Test</a>';
        let result;

        should.doesNotThrow(function () {
            result = htmlRelativeToTransformReady(html, siteUrl, itemPath, options);
        });

        result.should.equal('<a href=\\"#\\">Test</a>');
    });

    it('converts a relative URL', function () {
        const html = '<a href="/about#nowhere" title="Relative URL">';
        const result = htmlRelativeToTransformReady(html, siteUrl, itemPath, options);

        result.should.containEql('<a href="__GHOST_URL__/about#nowhere" title="Relative URL">');
    });

    it('skips relative URLs if subdirectory does not match', function () {
        const url = 'http://my-ghost-blog.com/blog';

        let html = '<a href="/about#nowhere" title="Relative URL">';
        htmlRelativeToTransformReady(html, url, options)
            .should.equal('<a href="/about#nowhere" title="Relative URL">');
    });

    it('converts page-relative URLs', function () {
        const url = 'http://my-ghost-blog.com/blog';

        let html = '<a href="about#nowhere" title="Relative URL">';
        htmlRelativeToTransformReady(html, url, 'blog/my-awesome-post', options)
            .should.equal('<a href="__GHOST_URL__/my-awesome-post/about#nowhere" title="Relative URL">');
    });

    it('converts relative URLs with matching subdirectories', function () {
        const url = 'http://my-ghost-blog.com/blog';

        let html = '<a href="/blog/about#nowhere" title="Relative URL">';
        htmlRelativeToTransformReady(html, url, 'blog/my-awesome-post', options)
            .should.equal('<a href="__GHOST_URL__/about#nowhere" title="Relative URL">');
    });

    it('converts relative URLs (not starting with "/") to absolute links using `itemPath` param', function () {
        const html = '<img src="my-image.png">';
        const result = htmlRelativeToTransformReady(html, siteUrl, itemPath, options);

        result.should.containEql('<img src="__GHOST_URL__/my-awesome-post/my-image.png">');
    });

    it('converts asset urls only with assetsOnly=true option', function () {
        options.assetsOnly = true;

        let html = '<a href="/about" title="Relative URL"><img src="/content/images/1.jpg">';
        let result = htmlRelativeToTransformReady(html, siteUrl, itemPath, options);

        result.should.containEql('<img src="__GHOST_URL__/content/images/1.jpg">');
        result.should.containEql('<a href="/about" title="Relative URL">');

        html = '<a href="/content/images/09/01/image.jpg">';
        result = htmlRelativeToTransformReady(html, siteUrl, itemPath, options);

        result.should.containEql('<a href="__GHOST_URL__/content/images/09/01/image.jpg">');

        html = '<img src="http://my-ghost-blog.de/content/images/09/01/image.jpg">';
        result = htmlRelativeToTransformReady(html, siteUrl, itemPath, options);

        result.should.containEql('<img src="http://my-ghost-blog.de/content/images/09/01/image.jpg">');

        html = '<img src="http://external.com/image.jpg">';
        result = htmlRelativeToTransformReady(html, siteUrl, itemPath, options);

        result.should.containEql('<img src="http://external.com/image.jpg">');

        const subdirUrl = 'https://my-ghost-blog.com/blog';
        html = '<a href="/blog/content/images/09/01/image.jpg">';
        result = htmlRelativeToTransformReady(html, subdirUrl, itemPath, options);

        result.should.containEql('<a href="__GHOST_URL__/content/images/09/01/image.jpg">');
    });

    it('keeps single vs double quotes for attributes', function () {
        let html = `<div data-options='{"strings": ["item1", "item2"]}'>`;
        let result = htmlRelativeToTransformReady(html, siteUrl, itemPath, options);

        result.should.eql(`<div data-options='{"strings": ["item1", "item2"]}'>`);

        html = `<a href="/test" data-options='{"strings": ["item1", "item2"]}'>Testing</a>`;
        result = htmlRelativeToTransformReady(html, siteUrl, itemPath, options);

        result.should.eql(`<a href="__GHOST_URL__/test" data-options='{"strings": ["item1", "item2"]}'>Testing</a>`);
    });

    it('ignores html inside <code> blocks', function () {
        let html = `<p><code><a href="/test">Test</a></p>`;
        let result = htmlRelativeToTransformReady(html, siteUrl, itemPath, options);

        result.should.eql(`<p><code><a href="/test">Test</a></p>`);

        html = '<p><a href="/test">Test</a><code><a href="/test">Test</a></code><a href="/test">Test</a></p>';
        result = htmlRelativeToTransformReady(html, siteUrl, itemPath, options);

        result.should.eql('<p><a href="__GHOST_URL__/test">Test</a><code><a href="/test">Test</a></code><a href="__GHOST_URL__/test">Test</a></p>');
    });

    it('keeps html indentation', function () {
        let html = `
<p>
    <a
        href="/test"
        data-test=true
    >
        Test
    </a>
</p>
`;
        let result = htmlRelativeToTransformReady(html, siteUrl, itemPath, options);
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
        let html = '<p><a href="/test">/test</a><code><a href="/test">/test</a></code><a href="/test">/test</a></p>';

        htmlRelativeToTransformReady(html, siteUrl, itemPath, options)
            .should.eql('<p><a href="__GHOST_URL__/test">/test</a><code><a href="/test">/test</a></code><a href="__GHOST_URL__/test">/test</a></p>');
    });

    it('skips any matching attribute/url pairs in plain text', function () {
        let html = '<p>You can use <code>href="/relative"</code> to make relative links like <a href="/relative">this</a></p>';

        htmlRelativeToTransformReady(html, siteUrl, itemPath, options)
            .should.eql('<p>You can use <code>href="/relative"</code> to make relative links like <a href="__GHOST_URL__/relative">this</a></p>');
    });

    it('skips <stream> elements', function () {
        let html = '<stream src="8f6257280d40bbb240853442ebb1c361" playsinline="" autoplay="" loop="" mute="">';

        htmlRelativeToTransformReady(html, siteUrl, itemPath, options)
            .should.eql(html);
    });

    describe('srcset support', function () {
        /* eslint-disable no-irregular-whitespace */
        it('converts multiple urls', function () {
            let html = `
                <img srcset="/content/images/elva-fairy-320w.jpg 320w,
                             /content/images/elva-fairy-480w.jpg 480w,
                             /content/images/elva-fairy-800w.jpg 800w"
                    sizes="(max-width: 320px) 280px,
                           (max-width: 480px) 440px,
                           800px"
                    src="/content/images/elva-fairy-800w.jpg" alt="Elva dressed as a fairy">
            `;

            let result = htmlRelativeToTransformReady(html, siteUrl, itemPath, options);

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

        it('forces https urls with options.secure = true', function () {
            let url = 'http://my-ghost-blog.com';

            let html = `
                <img srcset="/content/images/elva-fairy-320w.jpg 320w,
                             /content/images/elva-fairy-480w.jpg 480w,
                             /content/images/elva-fairy-800w.jpg 800w"
                    sizes="(max-width: 320px) 280px,
                           (max-width: 480px) 440px,
                           800px"
                    src="/content/images/elva-fairy-800w.jpg" alt="Elva dressed as a fairy">
            `;

            let result = htmlRelativeToTransformReady(html, url, itemPath, {secure: true});

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

    describe('DOM parsing is skipped', function () {
        let cheerioLoadSpy;

        beforeEach(function () {
            cheerioLoadSpy = sinon.spy(cheerio, 'load');
        });

        afterEach(function () {
            cheerioLoadSpy.restore();
        });

        it('when html has no attributes that would be transformed', function () {
            const url = 'http://my-ghost-blog.com/';

            htmlRelativeToTransformReady('', url, itemPath, options);
            cheerioLoadSpy.called.should.be.false('blank html triggered parse');

            htmlRelativeToTransformReady('<p>HTML without links</p>', url, itemPath, options);
            cheerioLoadSpy.called.should.be.false('html with no links triggered parse');

            htmlRelativeToTransformReady('<a href="#test">test</a>', url, itemPath, options);
            cheerioLoadSpy.callCount.should.equal(1, 'href didn\'t trigger parse');

            htmlRelativeToTransformReady('<img src="/image.png">', url, itemPath, options);
            cheerioLoadSpy.callCount.should.equal(2, 'src didn\'t trigger parse');

            htmlRelativeToTransformReady('<img srcset="/image-4x.png 4x, /image-2x.png 2x">)', url, itemPath, options);
            cheerioLoadSpy.callCount.should.equal(3, 'srcset didn\'t trigger parse');

            options.assetsOnly = true;
            htmlRelativeToTransformReady('<a href="/my-post/">post</a>', url, itemPath, options);
            cheerioLoadSpy.callCount.should.equal(3, 'href triggered parse when no url matches asset path');
        });
    });
});

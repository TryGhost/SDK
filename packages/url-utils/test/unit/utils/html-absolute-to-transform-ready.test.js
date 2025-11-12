// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const rewire = require('rewire');
const sinon = require('sinon');

const cheerio = require('cheerio');
const htmlTransform = rewire('../../../src/utils/html-transform');
const htmlAbsoluteToTransformReady = require('../../../src/utils/html-absolute-to-transform-ready');

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
    });
});

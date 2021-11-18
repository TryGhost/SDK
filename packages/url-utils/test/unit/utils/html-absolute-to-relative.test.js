// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const sinon = require('sinon');

const cheerio = require('cheerio');
const htmlAbsoluteToRelative = require('../../../lib/utils/html-absolute-to-relative');

describe('utils: htmlAbsoluteToRelative()', function () {
    const siteUrl = 'http://my-ghost-blog.com';
    let options;

    beforeEach(function () {
        options = {
            staticImageUrlPrefix: 'content/images'
        };
    });

    it('does not convert relative URLs', function () {
        const html = '<a href="/content/images">';
        const result = htmlAbsoluteToRelative(html, siteUrl, options);

        result.should.match(/<a href="\/content\/images">/);
    });

    it('does not convert internal links starting with "#"', function () {
        const html = '<a href="#jumptosection" title="Table of Content">';
        const result = htmlAbsoluteToRelative(html, siteUrl, options);

        result.should.match(/<a href="#jumptosection" title="Table of Content">/);
    });

    it('converts an an absolute URL on site domain', function () {
        const html = '<a href="https://my-ghost-blog.com/about#nowhere">';
        const result = htmlAbsoluteToRelative(html, siteUrl, options);

        result.should.match(/<a href="\/about#nowhere">/);
    });

    it('converts protocol relative `//` URLs', function () {
        const html = '<a href="//my-ghost-blog.com/content/images">';
        const result = htmlAbsoluteToRelative(html, siteUrl, options);

        result.should.match(/<a href="\/content\/images">/);
    });

    it('does not convert an an absolute URL on external domain', function () {
        const html = '<a href="https://external.com/about#nowhere">';
        const result = htmlAbsoluteToRelative(html, siteUrl, options);

        result.should.match(/<a href="https:\/\/external\.com\/about#nowhere">/);
    });

    it('converts an absolute URL including site subdirectory', function () {
        const html = '<a href="https://my-ghost-blog.com/blog/about#nowhere">';
        const result = htmlAbsoluteToRelative(html, 'https://my-ghost-blog.com/blog', options);

        result.should.match(/<a href="\/blog\/about#nowhere">/);
    });

    it('ignores protocol of absolute URLs', function () {
        const html = '<a href="http://my-ghost-blog.com/content/images">';
        const result = htmlAbsoluteToRelative(html, 'https://my-ghost-blog.com/', options);

        result.should.match(/<a href="\/content\/images">/);
    });

    it('only modifies asset urls with assetsOnly option set', function () {
        options.assetsOnly = true;

        let html = '<a href="https://my-ghost-blog.com/about"><img src="https://my-ghost-blog.com/content/images/1.jpg">';
        let result = htmlAbsoluteToRelative(html, siteUrl, options);
        result.should.match(/<img src="\/content\/images\/1.jpg">/);
        result.should.match(/<a href="https:\/\/my-ghost-blog.com\/about">/);

        html = '<a href="https://my-ghost-blog.com/content/images/09/01/image.jpg">';
        result = htmlAbsoluteToRelative(html, siteUrl, options);
        result.should.match(/<a href="\/content\/images\/09\/01\/image.jpg">/);

        html = '<a href="https://my-ghost-blog.com/blog/content/images/09/01/image.jpg">';
        result = htmlAbsoluteToRelative(html, 'https://my-ghost-blog.com/blog/', options);
        result.should.match(/<a href="\/blog\/content\/images\/09\/01\/image.jpg">/);

        html = '<img src="http://my-ghost-blog.de/content/images/09/01/image.jpg">';
        result = htmlAbsoluteToRelative(html, siteUrl, options);
        result.should.match(/<img src="http:\/\/my-ghost-blog.de\/content\/images\/09\/01\/image.jpg">/);

        html = '<img src="http://external.com/image.jpg">';
        result = htmlAbsoluteToRelative(html, siteUrl, options);
        result.should.match(/<img src="http:\/\/external.com\/image.jpg">/);
    });

    it('keeps single vs double quotes for attributes', function () {
        let html = `<div data-options='{"strings": ["item1", "item2"]}'>`;
        let result = htmlAbsoluteToRelative(html, siteUrl, options);

        result.should.eql(`<div data-options='{"strings": ["item1", "item2"]}'>`);

        html = `<a href="https://my-ghost-blog.com/test" data-options='{"strings": ["item1", "item2"]}'>Testing</a>`;
        result = htmlAbsoluteToRelative(html, siteUrl, options);

        result.should.eql(`<a href="/test" data-options='{"strings": ["item1", "item2"]}'>Testing</a>`);
    });

    it('ignores html inside <code> blocks', function () {
        let html = `<p><code><a href="https://my-ghost-blog.com/test">Test</a></p>`;
        let result = htmlAbsoluteToRelative(html, siteUrl, options);

        result.should.eql(`<p><code><a href="https://my-ghost-blog.com/test">Test</a></p>`);

        html = '<p><a href="https://my-ghost-blog.com/test">Test</a><code><a href="https://my-ghost-blog.com/test">Test</a></code><a href="https://my-ghost-blog.com/test">Test</a></p>';
        result = htmlAbsoluteToRelative(html, siteUrl, options);

        result.should.eql('<p><a href="/test">Test</a><code><a href="https://my-ghost-blog.com/test">Test</a></code><a href="/test">Test</a></p>');
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
        let result = htmlAbsoluteToRelative(html, siteUrl, options);
        result.should.eql(`
<p>
    <a
        href="/test"
        data-test=true
    >
        Test
    </a>
</p>
`);
    });

    it('skips any matching relative URLs outside of attributes', function () {
        let html = '<p><a href="http://my-ghost-blog.com/test">/test</a><code><a href="/test">/test</a></code><a href="http://my-ghost-blog.com/test">/test</a></p>';

        htmlAbsoluteToRelative(html, siteUrl, options)
            .should.eql('<p><a href="/test">/test</a><code><a href="/test">/test</a></code><a href="/test">/test</a></p>');
    });

    it('skips any matching attribute/url pairs in plain text', function () {
        let html = '<p>You can use <code>href="http://my-ghost-blog.com/relative"</code> to make links like <a href="http://my-ghost-blog.com/relative">this</a></p>';

        htmlAbsoluteToRelative(html, siteUrl, options)
            .should.eql('<p>You can use <code>href="http://my-ghost-blog.com/relative"</code> to make links like <a href="/relative">this</a></p>');
    });

    it('skips <stream> elements', function () {
        let html = '<stream src="http://my-ghost-blog.com/8f6257280d40bbb240853442ebb1c361" playsinline="" autoplay="" loop="" mute="">';

        htmlAbsoluteToRelative(html, siteUrl, options)
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

            let result = htmlAbsoluteToRelative(html, siteUrl, options);

            result.should.eql(`
                <img srcset="/content/images/elva-fairy-320w.jpg 320w,
                             /content/images/elva-fairy-480w.jpg 480w,
                             /content/images/elva-fairy-800w.jpg 800w"
                    sizes="(max-width: 320px) 280px,
                           (max-width: 480px) 440px,
                           800px"
                    src="/content/images/elva-fairy-800w.jpg" alt="Elva dressed as a fairy">
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

        it('when html has no absolute URLs matching siteUrl', function () {
            const url = 'http://my-ghost-blog.com/';

            htmlAbsoluteToRelative('', url, options);
            cheerioLoadSpy.called.should.be.false('blank html triggered parse');

            htmlAbsoluteToRelative('<a href="#test">test</a>', url, options);
            cheerioLoadSpy.called.should.be.false('hash url triggered parse');

            htmlAbsoluteToRelative('<a href="https://example.com">test</a>)', url, options);
            cheerioLoadSpy.called.should.be.false('external url triggered parse');

            htmlAbsoluteToRelative('<a href="http://my-ghost-blog.com">test</a>)', url, options);
            cheerioLoadSpy.calledOnce.should.be.true('site url didn\'t trigger parse');

            // ignores protocol when ignoreProtocol: true
            htmlAbsoluteToRelative('<a href="https://my-ghost-blog.com">test</a>)', url, options);
            cheerioLoadSpy.calledTwice.should.be.true('site url with different protocol didn\'t trigger parse');

            // respects protocol when ignoreProtocol: false
            options.ignoreProtocol = false;
            htmlAbsoluteToRelative('<a href="https://my-ghost-blog.com">test</a>)', url, options);
            cheerioLoadSpy.calledTwice.should.be.true('site url with different protocol triggered parse when ignoreProtocol is false');
        });
    });
});

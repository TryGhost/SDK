// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const sinon = require('sinon');
const rewire = require('rewire');
const htmlRelativeToAbsolute = rewire('../../../lib/utils/html-relative-to-absolute');

describe('utils: htmlRelativeToAbsolute()', function () {
    const siteUrl = 'http://my-ghost-blog.com';
    const itemPath = '/my-awesome-post';
    let options;

    beforeEach(function () {
        options = {
            staticImageUrlPrefix: 'content/images'
        };
    });

    it('does not convert absolute URLs', function () {
        const html = '<a href="http://my-ghost-blog.com/content/images" title="Absolute URL">';
        const result = htmlRelativeToAbsolute(html, siteUrl, itemPath, options);

        result.should.match(/<a href="http:\/\/my-ghost-blog.com\/content\/images" title="Absolute URL">/);
    });

    it('does not convert protocol relative `//` URLs', function () {
        const html = '<a href="//my-ghost-blog.com/content/images" title="Absolute URL">';
        const result = htmlRelativeToAbsolute(html, siteUrl, itemPath, options);

        result.should.match(/<a href="\/\/my-ghost-blog.com\/content\/images" title="Absolute URL">/);
    });

    it('does not convert internal links starting with "#"', function () {
        const html = '<a href="#jumptosection" title="Table of Content">';
        const result = htmlRelativeToAbsolute(html, siteUrl, itemPath, options);

        result.should.match(/<a href="#jumptosection" title="Table of Content">/);
    });

    it('does not throw on invalid urls', function () {
        const html = '<a href=\\"#\\">Test</a>';
        let result;

        should.doesNotThrow(function () {
            result = htmlRelativeToAbsolute(html, siteUrl, itemPath, options);
        });

        result.should.equal('<a href=\\"#\\">Test</a>');
    });

    it('converts a relative URL', function () {
        const html = '<a href="/about#nowhere" title="Relative URL">';
        const result = htmlRelativeToAbsolute(html, siteUrl, itemPath, options);

        result.should.match(/<a href="http:\/\/my-ghost-blog.com\/about#nowhere" title="Relative URL">/);
    });

    it('converts a relative URL including subdirectories', function () {
        const siteUrl = 'http://my-ghost-blog.com/blog';

        let html = '<a href="/about#nowhere" title="Relative URL">';
        htmlRelativeToAbsolute(html, siteUrl, 'blog/my-awesome-post', options)
            .should.equal('<a href="http://my-ghost-blog.com/blog/about#nowhere" title="Relative URL">');

        html = '<a href="about#nowhere" title="Relative URL">';
        htmlRelativeToAbsolute(html, siteUrl, 'blog/my-awesome-post', options)
            .should.equal('<a href="http://my-ghost-blog.com/blog/my-awesome-post/about#nowhere" title="Relative URL">');
    });

    it('converts relative URLs (not starting with "/") to absolute links using `itemPath` param', function () {
        const html = '<img src="my-image.png">';
        const result = htmlRelativeToAbsolute(html, siteUrl, itemPath, options);

        result.should.match(/<img src="http:\/\/my-ghost-blog.com\/my-awesome-post\/my-image.png">/);
    });

    it('converts asset urls only with assetsOnly=true option', function () {
        options.assetsOnly = true;

        let html = '<a href="/about" title="Relative URL"><img src="/content/images/1.jpg">';
        let result = htmlRelativeToAbsolute(html, siteUrl, itemPath, options);

        result.should.match(/<img src="http:\/\/my-ghost-blog.com\/content\/images\/1.jpg">/);
        result.should.match(/<a href="\/about" title="Relative URL">/);

        html = '<a href="/content/images/09/01/image.jpg">';
        result = htmlRelativeToAbsolute(html, siteUrl, itemPath, options);

        result.should.match(/<a href="http:\/\/my-ghost-blog.com\/content\/images\/09\/01\/image.jpg">/);

        html = '<a href="/blog/content/images/09/01/image.jpg">';
        result = htmlRelativeToAbsolute(html, siteUrl, itemPath, options);

        result.should.match(/<a href="http:\/\/my-ghost-blog.com\/blog\/content\/images\/09\/01\/image.jpg">/);

        html = '<img src="http://my-ghost-blog.de/content/images/09/01/image.jpg">';
        result = htmlRelativeToAbsolute(html, siteUrl, itemPath, options);

        result.should.match(/<img src="http:\/\/my-ghost-blog.de\/content\/images\/09\/01\/image.jpg">/);

        html = '<img src="http://external.com/image.jpg">';
        result = htmlRelativeToAbsolute(html, siteUrl, itemPath, options);

        result.should.match(/<img src="http:\/\/external.com\/image.jpg">/);
    });

    it('keeps single vs double quotes for attributes', function () {
        let html = `<div data-options='{"strings": ["item1", "item2"]}'>`;
        let result = htmlRelativeToAbsolute(html, siteUrl, itemPath, options);

        result.should.eql(`<div data-options='{"strings": ["item1", "item2"]}'>`);

        html = `<a href="/test" data-options='{"strings": ["item1", "item2"]}'>Testing</a>`;
        result = htmlRelativeToAbsolute(html, siteUrl, itemPath, options);

        result.should.eql(`<a href="http://my-ghost-blog.com/test" data-options='{"strings": ["item1", "item2"]}'>Testing</a>`);
    });

    it('ignores html inside <code> blocks', function () {
        let html = `<p><code><a href="/test">Test</a></p>`;
        let result = htmlRelativeToAbsolute(html, siteUrl, itemPath, options);

        result.should.eql(`<p><code><a href="/test">Test</a></p>`);

        html = '<p><a href="/test">Test</a><code><a href="/test">Test</a></code><a href="/test">Test</a></p>';
        result = htmlRelativeToAbsolute(html, siteUrl, itemPath, options);

        result.should.eql('<p><a href="http://my-ghost-blog.com/test">Test</a><code><a href="/test">Test</a></code><a href="http://my-ghost-blog.com/test">Test</a></p>');
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
        let result = htmlRelativeToAbsolute(html, siteUrl, itemPath, options);
        result.should.eql(`
<p>
    <a
        href="http://my-ghost-blog.com/test"
        data-test=true
    >
        Test
    </a>
</p>
`);
    });

    it('forces https urls with options.secure = true', function () {
        let siteUrl = 'http://my-ghost-blog.com';
        let html = '<p><a href="/test">Test</a><code><a href="/test">Test</a></code><a href="/test">Test</a></p>';

        htmlRelativeToAbsolute(html, siteUrl, itemPath)
            .should.eql('<p><a href="http://my-ghost-blog.com/test">Test</a><code><a href="/test">Test</a></code><a href="http://my-ghost-blog.com/test">Test</a></p>');

        htmlRelativeToAbsolute(html, siteUrl, itemPath, {secure: true})
            .should.eql('<p><a href="https://my-ghost-blog.com/test">Test</a><code><a href="/test">Test</a></code><a href="https://my-ghost-blog.com/test">Test</a></p>');
    });

    it('skips any matching relative URLs outside of attributes', function () {
        let html = '<p><a href="/test">/test</a><code><a href="/test">/test</a></code><a href="/test">/test</a></p>';

        htmlRelativeToAbsolute(html, siteUrl, itemPath, options)
            .should.eql('<p><a href="http://my-ghost-blog.com/test">/test</a><code><a href="/test">/test</a></code><a href="http://my-ghost-blog.com/test">/test</a></p>');
    });

    it('skips any matching attribute/url pairs in plain text', function () {
        let html = '<p>You can use <code>href="/relative"</code> to make relative links like <a href="/relative">this</a></p>';

        htmlRelativeToAbsolute(html, siteUrl, itemPath, options)
            .should.eql('<p>You can use <code>href="/relative"</code> to make relative links like <a href="http://my-ghost-blog.com/relative">this</a></p>');
    });

    it('skips <stream> elements', function () {
        let html = '<stream src="8f6257280d40bbb240853442ebb1c361" playsinline="" autoplay="" loop="" mute="">';

        htmlRelativeToAbsolute(html, siteUrl, itemPath, options)
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

            let result = htmlRelativeToAbsolute(html, siteUrl, itemPath, options);

            result.should.eql(`
                <img srcset="http://my-ghost-blog.com/content/images/elva-fairy-320w.jpg 320w,
                             http://my-ghost-blog.com/content/images/elva-fairy-480w.jpg 480w,
                             http://my-ghost-blog.com/content/images/elva-fairy-800w.jpg 800w"
                    sizes="(max-width: 320px) 280px,
                           (max-width: 480px) 440px,
                           800px"
                    src="http://my-ghost-blog.com/content/images/elva-fairy-800w.jpg" alt="Elva dressed as a fairy">
            `);
        });

        it('forces https urls with options.secure = true', function () {
            let siteUrl = 'http://my-ghost-blog.com';

            let html = `
                <img srcset="/content/images/elva-fairy-320w.jpg 320w,
                             /content/images/elva-fairy-480w.jpg 480w,
                             /content/images/elva-fairy-800w.jpg 800w"
                    sizes="(max-width: 320px) 280px,
                           (max-width: 480px) 440px,
                           800px"
                    src="/content/images/elva-fairy-800w.jpg" alt="Elva dressed as a fairy">
            `;

            let result = htmlRelativeToAbsolute(html, siteUrl, itemPath, {secure: true});

            result.should.eql(`
                <img srcset="https://my-ghost-blog.com/content/images/elva-fairy-320w.jpg 320w,
                             https://my-ghost-blog.com/content/images/elva-fairy-480w.jpg 480w,
                             https://my-ghost-blog.com/content/images/elva-fairy-800w.jpg 800w"
                    sizes="(max-width: 320px) 280px,
                           (max-width: 480px) 440px,
                           800px"
                    src="https://my-ghost-blog.com/content/images/elva-fairy-800w.jpg" alt="Elva dressed as a fairy">
            `);
        });
        /* eslint-enable no-irregular-whitespace */
    });

    describe('DOM parsing is skipped', function () {
        let cheerioLoadSpy, rewireRestore;

        beforeEach(function () {
            const cheerio = htmlRelativeToAbsolute.__get__('cheerio');
            cheerioLoadSpy = sinon.spy(cheerio, 'load');
            rewireRestore = htmlRelativeToAbsolute.__set__('cheerio', cheerio);
        });

        afterEach(function () {
            cheerioLoadSpy.restore();
            rewireRestore();
        });

        it('when html has no attributes that would be transformed', function () {
            const siteUrl = 'http://my-ghost-blog.com/';

            htmlRelativeToAbsolute('', siteUrl, itemPath, options);
            cheerioLoadSpy.called.should.be.false('blank html triggered parse');

            htmlRelativeToAbsolute('<p>HTML without links</p>', siteUrl, itemPath, options);
            cheerioLoadSpy.called.should.be.false('html with no links triggered parse');

            htmlRelativeToAbsolute('<a href="#test">test</a>', siteUrl, itemPath, options);
            cheerioLoadSpy.callCount.should.equal(1, 'href didn\'t trigger parse');

            htmlRelativeToAbsolute('<img src="/image.png">', siteUrl, itemPath, options);
            cheerioLoadSpy.callCount.should.equal(2, 'src didn\'t trigger parse');

            htmlRelativeToAbsolute('<img srcset="/image-4x.png 4x, /image-2x.png 2x">)', siteUrl, itemPath, options);
            cheerioLoadSpy.callCount.should.equal(3, 'srcset didn\'t trigger parse');

            options.assetsOnly = true;
            htmlRelativeToAbsolute('<a href="/my-post/">post</a>', siteUrl, itemPath, options);
            cheerioLoadSpy.callCount.should.equal(3, 'href triggered parse when no url matches asset path');
        });
    });
});

// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

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
});

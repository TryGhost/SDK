// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const htmlRelativeToAbsolute = require('../../../lib/utils/html-relative-to-absolute');

describe('utils: htmlRelativeToAbsolute()', function () {
    const siteUrl = 'http://my-ghost-blog.com';
    const itemUrl = 'my-awesome-post';
    const options = {
        staticImageUrlPrefix: 'content/images'
    };

    it('[success] does not convert absolute URLs', function () {
        const html = '<a href="http://my-ghost-blog.com/content/images" title="Absolute URL">';
        const result = htmlRelativeToAbsolute(html, siteUrl, itemUrl, options).html();

        result.should.match(/<a href="http:\/\/my-ghost-blog.com\/content\/images" title="Absolute URL">/);
    });
    it('[failure] does not convert protocol relative `//` URLs', function () {
        const html = '<a href="//my-ghost-blog.com/content/images" title="Absolute URL">';
        const result = htmlRelativeToAbsolute(html, siteUrl, itemUrl, options).html();

        result.should.match(/<a href="\/\/my-ghost-blog.com\/content\/images" title="Absolute URL">/);
    });
    it('[failure] does not convert internal links starting with "#"', function () {
        const html = '<a href="#jumptosection" title="Table of Content">';
        const result = htmlRelativeToAbsolute(html, siteUrl, itemUrl, options).html();

        result.should.match(/<a href="#jumptosection" title="Table of Content">/);
    });
    it('[success] converts a relative URL', function () {
        const html = '<a href="/about#nowhere" title="Relative URL">';
        const result = htmlRelativeToAbsolute(html, siteUrl, itemUrl, options).html();

        result.should.match(/<a href="http:\/\/my-ghost-blog.com\/about#nowhere" title="Relative URL">/);
    });
    it('[success] converts a relative URL including subdirectories', function () {
        const html = '<a href="/about#nowhere" title="Relative URL">';
        const result = htmlRelativeToAbsolute(html, 'http://my-ghost-blog.com/blog', itemUrl, options).html();

        result.should.match(/<a href="http:\/\/my-ghost-blog.com\/blog\/about#nowhere" title="Relative URL">/);
    });

    it('asset urls only', function () {
        options.assetsOnly = true;

        let html = '<a href="/about" title="Relative URL"><img src="/content/images/1.jpg">';
        let result = htmlRelativeToAbsolute(html, siteUrl, itemUrl, options).html();

        result.should.match(/<img src="http:\/\/my-ghost-blog.com\/content\/images\/1.jpg">/);
        result.should.match(/<a href="\/about" title="Relative URL">/);

        html = '<a href="/content/images/09/01/image.jpg">';
        result = htmlRelativeToAbsolute(html, siteUrl, itemUrl, options).html();

        result.should.match(/<a href="http:\/\/my-ghost-blog.com\/content\/images\/09\/01\/image.jpg">/);

        html = '<a href="/blog/content/images/09/01/image.jpg">';
        result = htmlRelativeToAbsolute(html, siteUrl, itemUrl, options).html();

        result.should.match(/<a href="http:\/\/my-ghost-blog.com\/blog\/content\/images\/09\/01\/image.jpg">/);

        html = '<img src="http://my-ghost-blog.de/content/images/09/01/image.jpg">';
        result = htmlRelativeToAbsolute(html, siteUrl, itemUrl, options).html();

        result.should.match(/<img src="http:\/\/my-ghost-blog.de\/content\/images\/09\/01\/image.jpg">/);

        html = '<img src="http://external.com/image.jpg">';
        result = htmlRelativeToAbsolute(html, siteUrl, itemUrl, options).html();

        result.should.match(/<img src="http:\/\/external.com\/image.jpg">/);
    });
});

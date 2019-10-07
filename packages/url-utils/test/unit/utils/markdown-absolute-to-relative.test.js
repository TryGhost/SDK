// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const markdownAbsoluteToRelative = require('../../../lib/utils/markdown-absolute-to-relative');

describe('utils: markdownAbsoluteToRelative()', function () {
    const siteUrl = 'http://my-ghost-blog.com';
    let options;

    beforeEach(function () {
        options = {
            staticImageUrlPrefix: 'content/images'
        };
    });

    it('converts absolute URLs in markdown', function () {
        const markdown = 'This is a [link](http://my-ghost-blog.com/link) and this is an ![](http://my-ghost-blog.com/content/images/image.png)';

        markdownAbsoluteToRelative(markdown, siteUrl, options)
            .should.equal('This is a [link](/link) and this is an ![](/content/images/image.png)');
    });

    it('converts absolute URLs in HTML', function () {
        const markdown = `
Testing <a href="http://my-ghost-blog.com/link">Inline</a> with **markdown**

<p>
    And block-level <img src="http://my-ghost-blog.com/content/images/image.png">
</p>
        `;

        const result = markdownAbsoluteToRelative(markdown, siteUrl, options);

        result.should.equal(`
Testing <a href="/link">Inline</a> with **markdown**

<p>
    And block-level <img src="/content/images/image.png">
</p>
        `);
    });

    it('skips absolute URLS in code blocks', function () {
        const markdown = '## Testing\n\n    ![](http://my-ghost-blog.com/content/images/image.png)';
        markdownAbsoluteToRelative(markdown, siteUrl, options)
            .should.equal(markdown);
    });

    it('converts only asset URLs with assetsOnly=true option', function () {
        const markdown = '![](http://my-ghost-blog.com/content/images/image.png) [](/not-an-asset)';

        options.assetsOnly = true;

        markdownAbsoluteToRelative(markdown, siteUrl, options)
            .should.equal('![](/content/images/image.png) [](/not-an-asset)');
    });

    it('retains whitespace layout', function () {
        const markdown = `

## Testing

    this is a code block
    `;

        const result = markdownAbsoluteToRelative(markdown, siteUrl, options);

        result.should.equal(`

## Testing

    this is a code block
    `);
    });

    it('retains whitespace layout inside list elements', function () {
        const markdown = '## testing\n\nmctesters\n\n- test\n- line\n- items"';
        markdownAbsoluteToRelative(markdown, siteUrl, options)
            .should.equal(markdown);
    });
});

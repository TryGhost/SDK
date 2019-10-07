// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const markdownRelativeToAbsolute = require('../../../lib/utils/markdown-relative-to-absolute');

describe('utils: markdownRelativeToAbsolute()', function () {
    const siteUrl = 'http://my-ghost-blog.com';
    const itemPath = '/my-awesome-post';
    let options;

    beforeEach(function () {
        options = {
            staticImageUrlPrefix: 'content/images'
        };
    });

    it('converts relative URLs in markdown', function () {
        const markdown = 'This is a [link](/link) and this is an ![](/content/images/image.png)';

        markdownRelativeToAbsolute(markdown, siteUrl, itemPath, options)
            .should.equal('This is a [link](http://my-ghost-blog.com/link) and this is an ![](http://my-ghost-blog.com/content/images/image.png)');
    });

    it('converts relative URLs in html', function () {
        const markdown = `
Testing <a href="/link">Inline</a> with **markdown**

<p>
    And block-level <img src="/content/images/image.png">
</p>
        `;

        const result = markdownRelativeToAbsolute(markdown, siteUrl, itemPath, options);

        result.should.equal(`
Testing <a href="http://my-ghost-blog.com/link">Inline</a> with **markdown**

<p>
    And block-level <img src="http://my-ghost-blog.com/content/images/image.png">
</p>
        `);
    });

    it('skips relative URLS in code blocks', function () {
        const markdown = '## Testing\n\n    ![](/content/images/image.png)';
        markdownRelativeToAbsolute(markdown, siteUrl, options)
            .should.equal(markdown);
    });

    it('converts only asset urls with assetsOnly=true option', function () {
        const markdown = '![](/content/images/image.png) [](/not-an-asset)';

        options.assetsOnly = true;

        markdownRelativeToAbsolute(markdown, siteUrl, itemPath, options)
            .should.equal('![](http://my-ghost-blog.com/content/images/image.png) [](/not-an-asset)');
    });

    it('retains whitespace layout', function () {
        const markdown = `

## Testing

    this is a code block
    `;

        const result = markdownRelativeToAbsolute(markdown, siteUrl, itemPath, options);

        result.should.equal(`

## Testing

    this is a code block
    `);
    });

    it('retains whitespace layout inside list elements', function () {
        const markdown = '## testing\n\nmctesters\n\n- test\n- line\n- items"';
        markdownRelativeToAbsolute(markdown, siteUrl, options)
            .should.equal(markdown);
    });
});

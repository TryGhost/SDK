// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const fs = require('fs');
const path = require('path');
const markdownTransformReadyToAbsolute = require('../../../lib/utils/markdown-transform-ready-to-absolute');

describe('utils: markdownTransformReadyToAbsolute()', function () {
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

        markdownTransformReadyToAbsolute(transformReadyMarkdown, 'https://demo.ghost.io/', options)
            .should.equal(absoluteMarkdown);
    });

    it('converts transform-ready URLs in markdown', function () {
        const markdown = 'This is a [link](__GHOST_URL__/link) and this is an ![](__GHOST_URL__/content/images/image.png)';

        markdownTransformReadyToAbsolute(markdown, siteUrl, options)
            .should.equal('This is a [link](http://my-ghost-blog.com/link) and this is an ![](http://my-ghost-blog.com/content/images/image.png)');
    });

    it('converts transform-ready URLs with subdir site url', function () {
        const markdown = 'This is a [link](__GHOST_URL__/link) and this is an ![](__GHOST_URL__/content/images/image.png)';

        markdownTransformReadyToAbsolute(markdown, 'http://my-ghost-blog.com/subdir', options)
            .should.equal('This is a [link](http://my-ghost-blog.com/subdir/link) and this is an ![](http://my-ghost-blog.com/subdir/content/images/image.png)');
    });

    it('converts transform-ready URLs in html', function () {
        const markdown = `
Testing <a href="__GHOST_URL__/link">Inline</a> with **markdown**

<p>
    And block-level <img src="__GHOST_URL__/content/images/image.png">
</p>
        `;

        const result = markdownTransformReadyToAbsolute(markdown, siteUrl, options);

        result.should.equal(`
Testing <a href="http://my-ghost-blog.com/link">Inline</a> with **markdown**

<p>
    And block-level <img src="http://my-ghost-blog.com/content/images/image.png">
</p>
        `);
    });

    it('retains whitespace layout', function () {
        const markdown = `

## Testing

    this is a code block
    `;

        const result = markdownTransformReadyToAbsolute(markdown, siteUrl, options);

        result.should.equal(`

## Testing

    this is a code block
    `);
    });

    it('retains whitespace layout inside list elements', function () {
        const markdown = '## testing\n\nmctesters\n\n- test\n- line\n- items"';
        markdownTransformReadyToAbsolute(markdown, siteUrl, options)
            .should.equal(markdown);
    });

    it('does not strip chars from end', function () {
        const markdown = '<a href="https://example.com">Test</a> <a href="https://example.com/2">Test2</a> Test';

        markdownTransformReadyToAbsolute(markdown, siteUrl, options)
            .should.equal(markdown);
    });
});

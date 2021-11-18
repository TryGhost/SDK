// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const fs = require('fs');
const path = require('path');
const rewire = require('rewire');
const sinon = require('sinon');

const remark = require('remark');
const markdownTransform = rewire('../../../lib/utils/_markdown-transform');
const markdownAbsoluteToRelative = rewire('../../../lib/utils/markdown-absolute-to-relative');

describe('utils: markdownAbsoluteToRelative()', function () {
    const siteUrl = 'http://my-ghost-blog.com';
    let options;

    beforeEach(function () {
        options = {
            staticImageUrlPrefix: 'content/images'
        };
    });

    it('works (demo post)', function () {
        const relativeMarkdown = fs.readFileSync(path.join(__dirname, '../../fixtures/long-markdown-relative.md'), 'utf8');
        const absoluteMarkdown = fs.readFileSync(path.join(__dirname, '../../fixtures/long-markdown-absolute.md'), 'utf8');

        markdownAbsoluteToRelative(absoluteMarkdown, 'https://demo.ghost.io/', options)
            .should.equal(relativeMarkdown);
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

    it('converts protocol relative `//` URLs', function () {
        const markdown = '![](//my-ghost-blog.com/content/images/image.png)';
        const result = markdownAbsoluteToRelative(markdown, siteUrl, options);

        result.should.equal('![](/content/images/image.png)');
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

    it('does not strip chars from end', function () {
        const markdown = '<a href="https://example.com">Test</a> <a href="https://example.com/2">Test2</a> Test';

        markdownAbsoluteToRelative(markdown, siteUrl, options)
            .should.equal(markdown);
    });

    it('handles linked images', function () {
        const markdown = '[![Test](http://my-ghost-blog.com/content/images/2014/01/test.jpg)](http://my-ghost-blog.com/content/images/2014/01/test.jpg)';

        const result = markdownAbsoluteToRelative(markdown, siteUrl, options);

        result.should.equal('[![Test](/content/images/2014/01/test.jpg)](/content/images/2014/01/test.jpg)');
    });

    describe('AST parsing is skipped', function () {
        let remarkSpy, sandbox;

        beforeEach(function () {
            sandbox = sinon.createSandbox();
            remarkSpy = sinon.spy(remark);
            markdownTransform.__set__('remark', remarkSpy);
            markdownAbsoluteToRelative.__set__('markdownTransform', markdownTransform);
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('when markdown has no absolute URLs matching siteUrl', function () {
            const url = 'http://my-ghost-blog.com/';

            markdownAbsoluteToRelative('', url, options);
            remarkSpy.called.should.be.false();

            markdownAbsoluteToRelative('[test](#test)', url, options);
            remarkSpy.called.should.be.false();

            markdownAbsoluteToRelative('[test](https://example.com)', url, options);
            remarkSpy.called.should.be.false();

            markdownAbsoluteToRelative('[test](http://my-ghost-blog.com)', url, options);
            remarkSpy.calledOnce.should.be.true();

            // ignores protocol when ignoreProtocol: true
            markdownAbsoluteToRelative('[test](https://my-ghost-blog.com)', url, options);
            remarkSpy.calledTwice.should.be.true();

            // respects protocol when ignoreProtocol: false
            options.ignoreProtocol = false;
            markdownAbsoluteToRelative('[test](https://my-ghost-blog.com)', url, options);
            remarkSpy.calledTwice.should.be.true();
        });
    });
});

// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const fs = require('fs');
const path = require('path');
const sinon = require('sinon');
const rewire = require('rewire');

const remark = require('remark');
const markdownTransform = rewire('../../../lib/utils/_markdown-transform');
const markdownRelativeToAbsolute = rewire('../../../lib/utils/markdown-relative-to-absolute');

describe('utils: markdownRelativeToAbsolute()', function () {
    const siteUrl = 'http://my-ghost-blog.com';
    const itemPath = '/my-awesome-post';
    let options;

    beforeEach(function () {
        options = {
            staticImageUrlPrefix: 'content/images'
        };
    });

    it('works (demo post)', function () {
        const relativeMarkdown = fs.readFileSync(path.join(__dirname, '../../fixtures/long-markdown-relative.md'), 'utf8');
        const absoluteMarkdown = fs.readFileSync(path.join(__dirname, '../../fixtures/long-markdown-absolute.md'), 'utf8');

        markdownRelativeToAbsolute(relativeMarkdown, 'https://demo.ghost.io/', 'https://demo.ghost.io/test/', options)
            .should.equal(absoluteMarkdown);
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
        markdownRelativeToAbsolute(markdown, siteUrl, itemPath, options)
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
        markdownRelativeToAbsolute(markdown, siteUrl, itemPath, options)
            .should.equal(markdown);
    });

    it('does not strip chars from end', function () {
        const markdown = '<a href="https://example.com">Test</a> <a href="https://example.com/2">Test2</a> Test';

        markdownRelativeToAbsolute(markdown, siteUrl, itemPath, options)
            .should.equal(markdown);
    });

    it('handles linked images', function () {
        const markdown = '[![Test](/content/images/2014/01/test.jpg)](/content/images/2014/01/test.jpg)';

        const result = markdownRelativeToAbsolute(markdown, siteUrl, itemPath, options);

        result.should.equal('[![Test](http://my-ghost-blog.com/content/images/2014/01/test.jpg)](http://my-ghost-blog.com/content/images/2014/01/test.jpg)');
    });

    describe('AST parsing is skipped', function () {
        let remarkSpy, sandbox;

        beforeEach(function () {
            sandbox = sinon.createSandbox();
            remarkSpy = sinon.spy(remark);
            markdownTransform.__set__('remark', remarkSpy);
            markdownRelativeToAbsolute.__set__('markdownTransform', markdownTransform);
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('when markdown has no content that would be transformed', function () {
            const url = 'http://my-ghost-blog.com/';

            markdownRelativeToAbsolute('', url, itemPath, options);
            remarkSpy.called.should.be.false('blank markdown triggered parse');

            markdownRelativeToAbsolute('# Testing plain markdown', url, itemPath, options);
            remarkSpy.called.should.be.false('markdown with no links/images triggered parse');

            markdownRelativeToAbsolute('<p>HTML without links</p>', url, itemPath, options);
            remarkSpy.called.should.be.false('html with no links triggered parse');

            markdownRelativeToAbsolute('[test](/test)', url, itemPath, options);
            remarkSpy.callCount.should.equal(1, 'markdown link didn\'t trigger parse');

            markdownRelativeToAbsolute('![test](/image.png)', url, itemPath, options);
            remarkSpy.callCount.should.equal(2, 'markdown image didn\'t trigger parse');

            markdownRelativeToAbsolute('<a href="#test">test</a>', url, itemPath, options);
            remarkSpy.callCount.should.equal(3, 'href didn\'t trigger parse');

            markdownRelativeToAbsolute('<img src="/image.png">', url, itemPath, options);
            remarkSpy.callCount.should.equal(4, 'src didn\'t trigger parse');

            markdownRelativeToAbsolute('<img srcset="/image-4x.png 4x, /image-2x.png 2x">)', url, itemPath, options);
            remarkSpy.callCount.should.equal(5, 'srcset didn\'t trigger parse');

            options.assetsOnly = true;
            markdownRelativeToAbsolute('[test](/my-post)', url, itemPath, options);
            remarkSpy.callCount.should.equal(5, 'markdown link triggered parse when no url matches asset path');

            markdownRelativeToAbsolute('<a href="/my-post/">post</a>', url, itemPath, options);
            remarkSpy.callCount.should.equal(5, 'href triggered parse when no url matches asset path');
        });
    });
});

// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const sinon = require('sinon');
const rewire = require('rewire');
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

    describe('AST parsing is skipped', function () {
        let remarkSpy, sandbox;

        beforeEach(function () {
            sandbox = sinon.createSandbox();
            const remark = markdownRelativeToAbsolute.__get__('remark');
            remarkSpy = sinon.spy(remark);
            markdownRelativeToAbsolute.__set__('remark', remarkSpy);
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('when markdown has no content that would be transformed', function () {
            const siteUrl = 'http://my-ghost-blog.com/';

            markdownRelativeToAbsolute('', siteUrl, itemPath, options);
            remarkSpy.called.should.be.false('blank markdown triggered parse');

            markdownRelativeToAbsolute('# Testing plain markdown', siteUrl, itemPath, options);
            remarkSpy.called.should.be.false('markdown with no links/images triggered parse');

            markdownRelativeToAbsolute('<p>HTML without links</p>', siteUrl, itemPath, options);
            remarkSpy.called.should.be.false('html with no links triggered parse');

            markdownRelativeToAbsolute('[test](/test)', siteUrl, itemPath, options);
            remarkSpy.callCount.should.equal(1, 'markdown link didn\'t trigger parse');

            markdownRelativeToAbsolute('![test](/image.png)', siteUrl, itemPath, options);
            remarkSpy.callCount.should.equal(2, 'markdown image didn\'t trigger parse');

            markdownRelativeToAbsolute('<a href="#test">test</a>', siteUrl, itemPath, options);
            remarkSpy.callCount.should.equal(3, 'href didn\'t trigger parse');

            markdownRelativeToAbsolute('<img src="/image.png">', siteUrl, itemPath, options);
            remarkSpy.callCount.should.equal(4, 'src didn\'t trigger parse');

            markdownRelativeToAbsolute('<img srcset="/image-4x.png 4x, /image-2x.png 2x">)', siteUrl, itemPath, options);
            remarkSpy.callCount.should.equal(5, 'srcset didn\'t trigger parse');

            options.assetsOnly = true;
            markdownRelativeToAbsolute('[test](/my-post)', siteUrl, itemPath, options);
            remarkSpy.callCount.should.equal(5, 'markdown link triggered parse when no url matches asset path');

            markdownRelativeToAbsolute('<a href="/my-post/">post</a>', siteUrl, itemPath, options);
            remarkSpy.callCount.should.equal(5, 'href triggered parse when no url matches asset path');
        });
    });
});

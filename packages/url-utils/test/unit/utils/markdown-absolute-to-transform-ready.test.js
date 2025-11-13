// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const fs = require('fs');
const path = require('path');
const rewire = require('rewire');
const sinon = require('sinon');

const remark = require('remark');
const markdownTransform = rewire('../../../lib/utils/markdown-transform');
const markdownAbsoluteToTransformReady = rewire('../../../lib/utils/markdown-absolute-to-transform-ready');

describe('utils: markdownAbsoluteToTransformReady()', function () {
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

        markdownAbsoluteToTransformReady(absoluteMarkdown, 'https://demo.ghost.io/', options)
            .should.equal(transformReadyMarkdown);
    });

    it('converts absolute URLs in markdown', function () {
        const markdown = 'This is a [link](http://my-ghost-blog.com/link) and this is an ![](http://my-ghost-blog.com/content/images/image.png)';

        markdownAbsoluteToTransformReady(markdown, siteUrl, options)
            .should.equal('This is a [link](__GHOST_URL__/link) and this is an ![](__GHOST_URL__/content/images/image.png)');
    });

    it('converts absolute URLs in HTML', function () {
        const markdown = `
Testing <a href="http://my-ghost-blog.com/link">Inline</a> with **markdown**

<p>
    And block-level <img src="http://my-ghost-blog.com/content/images/image.png">
</p>
        `;

        const result = markdownAbsoluteToTransformReady(markdown, siteUrl, options);

        result.should.equal(`
Testing <a href="__GHOST_URL__/link">Inline</a> with **markdown**

<p>
    And block-level <img src="__GHOST_URL__/content/images/image.png">
</p>
        `);
    });

    it('converts protocol relative `//` URLs', function () {
        const markdown = '![](//my-ghost-blog.com/content/images/image.png)';
        const result = markdownAbsoluteToTransformReady(markdown, siteUrl, options);

        result.should.equal('![](__GHOST_URL__/content/images/image.png)');
    });

    it('skips absolute URLS in code blocks', function () {
        const markdown = '## Testing\n\n    ![](http://my-ghost-blog.com/content/images/image.png)';
        markdownAbsoluteToTransformReady(markdown, siteUrl, options)
            .should.equal(markdown);
    });

    it('converts only asset URLs with assetsOnly=true option', function () {
        const markdown = '![](http://my-ghost-blog.com/content/images/image.png) [](http://my-ghost-blog.com/not-an-asset)';

        options.assetsOnly = true;

        markdownAbsoluteToTransformReady(markdown, siteUrl, options)
            .should.equal('![](__GHOST_URL__/content/images/image.png) [](http://my-ghost-blog.com/not-an-asset)');
    });

    it('retains whitespace layout', function () {
        const markdown = `

## Testing

    this is a code block
    `;

        const result = markdownAbsoluteToTransformReady(markdown, siteUrl, options);

        result.should.equal(`

## Testing

    this is a code block
    `);
    });

    it('retains whitespace layout inside list elements', function () {
        const markdown = '## testing\n\nmctesters\n\n- test\n- line\n- items"';
        markdownAbsoluteToTransformReady(markdown, siteUrl, options)
            .should.equal(markdown);
    });

    it('does not strip chars from end', function () {
        const markdown = '<a href="https://example.com">Test</a> <a href="https://example.com/2">Test2</a> Test';

        markdownAbsoluteToTransformReady(markdown, siteUrl, options)
            .should.equal(markdown);
    });

    it('handles linked images', function () {
        const markdown = '[![Test](http://my-ghost-blog.com/content/images/2014/01/test.jpg)](http://my-ghost-blog.com/content/images/2014/01/test.jpg)';

        const result = markdownAbsoluteToTransformReady(markdown, siteUrl, options);

        result.should.equal('[![Test](__GHOST_URL__/content/images/2014/01/test.jpg)](__GHOST_URL__/content/images/2014/01/test.jpg)');
    });

    it('handles default options when options is not provided', function () {
        const markdown = 'This is a [link](http://my-ghost-blog.com/link)';
        const result = markdownAbsoluteToTransformReady(markdown, siteUrl);

        result.should.equal('This is a [link](__GHOST_URL__/link)');
    });

    it('handles ignoreProtocol option', function () {
        const markdown = 'This is a [link](https://my-ghost-blog.com/link)';
        const testOptions = {
            ignoreProtocol: true
        };
        const result = markdownAbsoluteToTransformReady(markdown, 'http://my-ghost-blog.com', testOptions);

        result.should.equal('This is a [link](__GHOST_URL__/link)');
    });

    it('handles ignoreProtocol option set to false', function () {
        const markdown = 'This is a [link](https://my-ghost-blog.com/link)';
        const testOptions = {
            ignoreProtocol: false
        };
        const result = markdownAbsoluteToTransformReady(markdown, 'http://my-ghost-blog.com', testOptions);

        result.should.equal('This is a [link](https://my-ghost-blog.com/link)');
    });

    it('handles assetsOnly option', function () {
        const markdown = '![](http://my-ghost-blog.com/content/images/image.png) [](http://my-ghost-blog.com/not-an-asset)';
        const testOptions = {
            assetsOnly: true
        };
        const result = markdownAbsoluteToTransformReady(markdown, siteUrl, testOptions);

        result.should.equal('![](__GHOST_URL__/content/images/image.png) [](http://my-ghost-blog.com/not-an-asset)');
    });

    it('handles siteUrl with trailing slash', function () {
        const markdown = 'This is a [link](http://my-ghost-blog.com/link)';
        const result = markdownAbsoluteToTransformReady(markdown, 'http://my-ghost-blog.com/', options);

        result.should.equal('This is a [link](__GHOST_URL__/link)');
    });

    it('handles siteUrl with https protocol', function () {
        const markdown = 'This is a [link](https://my-ghost-blog.com/link)';
        const result = markdownAbsoluteToTransformReady(markdown, 'https://my-ghost-blog.com', options);

        result.should.equal('This is a [link](__GHOST_URL__/link)');
    });

    describe('AST parsing is skipped', function () {
        let remarkSpy, sandbox;

        beforeEach(function () {
            sandbox = sinon.createSandbox();
            remarkSpy = sinon.spy(remark);
            markdownTransform.__set__('remark', remarkSpy);
            markdownAbsoluteToTransformReady.__set__('markdownTransform', markdownTransform);
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('when markdown has no absolute URLs matching siteUrl', function () {
            const url = 'http://my-ghost-blog.com/';

            markdownAbsoluteToTransformReady('', url, options);
            remarkSpy.called.should.be.false();

            markdownAbsoluteToTransformReady('[test](#test)', url, options);
            remarkSpy.called.should.be.false();

            markdownAbsoluteToTransformReady('[test](https://example.com)', url, options);
            remarkSpy.called.should.be.false();

            markdownAbsoluteToTransformReady('[test](http://my-ghost-blog.com)', url, options);
            remarkSpy.calledOnce.should.be.true();

            // ignores protocol when ignoreProtocol: true
            markdownAbsoluteToTransformReady('[test](https://my-ghost-blog.com)', url, options);
            remarkSpy.calledTwice.should.be.true();

            // respects protocol when ignoreProtocol: false
            options.ignoreProtocol = false;
            markdownAbsoluteToTransformReady('[test](https://my-ghost-blog.com)', url, options);
            remarkSpy.calledTwice.should.be.true();
        });
    });
});

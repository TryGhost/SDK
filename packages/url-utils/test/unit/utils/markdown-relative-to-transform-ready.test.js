// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const fs = require('fs');
const path = require('path');
const sinon = require('sinon');
const rewire = require('rewire');

const remark = require('remark');
const markdownTransform = rewire('../../../src/utils/markdown-transform');
const markdownRelativeToTransformReady = rewire('../../../src/utils/markdown-relative-to-transform-ready');

describe('utils: markdownRelativeToTransformReady()', function () {
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
        const transformReadyMarkdown = fs.readFileSync(path.join(__dirname, '../../fixtures/long-markdown-transform-ready.md'), 'utf8');

        markdownRelativeToTransformReady(relativeMarkdown, 'https://demo.ghost.io/', 'https://demo.ghost.io/test/', options)
            .should.equal(transformReadyMarkdown);
    });

    it('converts relative URLs in markdown', function () {
        const markdown = 'This is a [link](/link) and this is an ![](/content/images/image.png)';

        markdownRelativeToTransformReady(markdown, siteUrl, itemPath, options)
            .should.equal('This is a [link](__GHOST_URL__/link) and this is an ![](__GHOST_URL__/content/images/image.png)');
    });

    it('converts relative URLs in html', function () {
        const markdown = `
Testing <a href="/link">Inline</a> with **markdown**

<p>
    And block-level <img src="/content/images/image.png">
</p>
        `;

        const result = markdownRelativeToTransformReady(markdown, siteUrl, itemPath, options);

        result.should.equal(`
Testing <a href="__GHOST_URL__/link">Inline</a> with **markdown**

<p>
    And block-level <img src="__GHOST_URL__/content/images/image.png">
</p>
        `);
    });

    it('skips relative URLS in code blocks', function () {
        const markdown = '## Testing\n\n    ![](/content/images/image.png)';
        markdownRelativeToTransformReady(markdown, siteUrl, itemPath, options)
            .should.equal(markdown);
    });

    it('converts only asset urls with assetsOnly=true option', function () {
        const markdown = '![](/content/images/image.png) [](/not-an-asset)';

        options.assetsOnly = true;

        markdownRelativeToTransformReady(markdown, siteUrl, itemPath, options)
            .should.equal('![](__GHOST_URL__/content/images/image.png) [](/not-an-asset)');
    });

    it('retains whitespace layout', function () {
        const markdown = `

## Testing

    this is a code block
    `;

        const result = markdownRelativeToTransformReady(markdown, siteUrl, itemPath, options);

        result.should.equal(`

## Testing

    this is a code block
    `);
    });

    it('retains whitespace layout inside list elements', function () {
        const markdown = '## testing\n\nmctesters\n\n- test\n- line\n- items"';
        markdownRelativeToTransformReady(markdown, siteUrl, itemPath, options)
            .should.equal(markdown);
    });

    it('does not strip chars from end', function () {
        const markdown = '<a href="https://example.com">Test</a> <a href="https://example.com/2">Test2</a> Test';

        markdownRelativeToTransformReady(markdown, siteUrl, itemPath, options)
            .should.equal(markdown);
    });

    it('handles linked images', function () {
        const markdown = '[![Test](/content/images/2014/01/test.jpg)](/post)';

        const result = markdownRelativeToTransformReady(markdown, siteUrl, itemPath, options);

        result.should.equal('[![Test](__GHOST_URL__/content/images/2014/01/test.jpg)](__GHOST_URL__/post)');
    });

    it('handles images linked to themselves', function () {
        const markdown = '[![Test](/content/images/2014/01/test.jpg)](/content/images/2014/01/test.jpg)';

        const result = markdownRelativeToTransformReady(markdown, siteUrl, itemPath, options);

        result.should.equal('[![Test](__GHOST_URL__/content/images/2014/01/test.jpg)](__GHOST_URL__/content/images/2014/01/test.jpg)');
    });

    it('handles linked images with further content', function () {
        const markdown = `
[![Test](/content/images/2014/01/test.jpg)](/post)
[![Test](/content/images/2014/01/test.jpg)](/content/images/2014/01/test.jpg)
Just testing
![](/content/images/image.png) [](/just-a-link)
        `;

        const result = markdownRelativeToTransformReady(markdown, siteUrl, itemPath, options);

        result.should.equal(`
[![Test](__GHOST_URL__/content/images/2014/01/test.jpg)](__GHOST_URL__/post)
[![Test](__GHOST_URL__/content/images/2014/01/test.jpg)](__GHOST_URL__/content/images/2014/01/test.jpg)
Just testing
![](__GHOST_URL__/content/images/image.png) [](__GHOST_URL__/just-a-link)
        `);
    });

    it('handles default options when options is not provided', function () {
        const markdown = 'This is a [link](/link)';
        const result = markdownRelativeToTransformReady(markdown, siteUrl, itemPath);

        result.should.equal('This is a [link](__GHOST_URL__/link)');
    });

    it('handles assetsOnly option with staticImageUrlPrefix', function () {
        const markdown = '![](/content/images/image.png) [](/not-an-asset)';
        const testOptions = {
            assetsOnly: true,
            staticImageUrlPrefix: 'content/images'
        };
        const result = markdownRelativeToTransformReady(markdown, siteUrl, itemPath, testOptions);

        result.should.equal('![](__GHOST_URL__/content/images/image.png) [](/not-an-asset)');
    });

    it('handles assetsOnly option without staticImageUrlPrefix', function () {
        const markdown = '![](/content/images/image.png) [](/not-an-asset)';
        const testOptions = {
            assetsOnly: true
        };
        const result = markdownRelativeToTransformReady(markdown, siteUrl, itemPath, testOptions);

        result.should.equal('![](__GHOST_URL__/content/images/image.png) [](/not-an-asset)');
    });

    describe('AST parsing is skipped', function () {
        let remarkSpy, sandbox;

        beforeEach(function () {
            sandbox = sinon.createSandbox();
            remarkSpy = sinon.spy(remark);
            markdownTransform.__set__('remark', remarkSpy);
            markdownRelativeToTransformReady.__set__('markdownTransform', markdownTransform);
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('when markdown has no content that would be transformed', function () {
            const url = 'http://my-ghost-blog.com/';

            markdownRelativeToTransformReady('', url, itemPath, options);
            remarkSpy.called.should.be.false('blank markdown triggered parse');

            markdownRelativeToTransformReady('# Testing plain markdown', url, itemPath, options);
            remarkSpy.called.should.be.false('markdown with no links/images triggered parse');

            markdownRelativeToTransformReady('<p>HTML without links</p>', url, itemPath, options);
            remarkSpy.called.should.be.false('html with no links triggered parse');

            markdownRelativeToTransformReady('[test](/test)', url, itemPath, options);
            remarkSpy.callCount.should.equal(1, 'markdown link didn\'t trigger parse');

            markdownRelativeToTransformReady('![test](/image.png)', url, itemPath, options);
            remarkSpy.callCount.should.equal(2, 'markdown image didn\'t trigger parse');

            markdownRelativeToTransformReady('<a href="#test">test</a>', url, itemPath, options);
            remarkSpy.callCount.should.equal(3, 'href didn\'t trigger parse');

            markdownRelativeToTransformReady('<img src="/image.png">', url, itemPath, options);
            remarkSpy.callCount.should.equal(4, 'src didn\'t trigger parse');

            markdownRelativeToTransformReady('<img srcset="/image-4x.png 4x, /image-2x.png 2x">)', url, itemPath, options);
            remarkSpy.callCount.should.equal(5, 'srcset didn\'t trigger parse');

            options.assetsOnly = true;
            markdownRelativeToTransformReady('[test](/my-post)', url, itemPath, options);
            remarkSpy.callCount.should.equal(5, 'markdown link triggered parse when no url matches asset path');

            markdownRelativeToTransformReady('<a href="/my-post/">post</a>', url, itemPath, options);
            remarkSpy.callCount.should.equal(5, 'href triggered parse when no url matches asset path');
        });
    });
});

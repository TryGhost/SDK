require('../../utils');

const toTransformReady = require('../../../lib/utils/to-transform-ready').default;

describe('utils: toTransformReady()', function () {
    const siteUrl = 'http://my-ghost-blog.com';
    const itemPath = '/my-awesome-post';
    let options;

    beforeEach(function () {
        options = {
            staticImageUrlPrefix: 'content/images'
        };
    });

    it('converts relative URL to transform-ready', function () {
        const url = '/my/file.png';
        const result = toTransformReady(url, siteUrl, itemPath, options);

        result.should.equal('__GHOST_URL__/my/file.png');
    });

    it('converts page-relative URL to transform-ready', function () {
        const url = 'my/file.png';
        const result = toTransformReady(url, siteUrl, itemPath, options);

        result.should.equal('__GHOST_URL__/my-awesome-post/my/file.png');
    });

    it('handles options when itemPath is an object', function () {
        const url = '/my/file.png';
        const optionsAsItemPath = {
            staticImageUrlPrefix: 'content/images'
        };
        const result = toTransformReady(url, siteUrl, optionsAsItemPath);

        result.should.equal('__GHOST_URL__/my/file.png');
    });

    it('handles options when itemPath is an object and options is null', function () {
        const url = '/my/file.png';
        const optionsAsItemPath = {
            staticImageUrlPrefix: 'content/images'
        };
        const result = toTransformReady(url, siteUrl, optionsAsItemPath, null);

        result.should.equal('__GHOST_URL__/my/file.png');
    });

    it('works with subdirectories', function () {
        const url = 'http://my-ghost-blog.com/blog/my/file.png';
        const rootUrl = 'http://my-ghost-blog.com/blog';
        const result = toTransformReady(url, rootUrl, itemPath, options);

        result.should.equal('__GHOST_URL__/my/file.png');
    });

    it('handles absolute URLs', function () {
        const url = 'http://my-ghost-blog.com/my/file.png';
        const result = toTransformReady(url, siteUrl, itemPath, options);

        result.should.equal('__GHOST_URL__/my/file.png');
    });

    it('ignores external URLs', function () {
        const url = 'http://external.com/my/file.png';
        const result = toTransformReady(url, siteUrl, itemPath, options);

        result.should.equal('http://external.com/my/file.png');
    });
});


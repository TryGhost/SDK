// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const absoluteToTransformReady = require('../../../lib/utils/absolute-to-transform-ready');

describe('utils: absoluteToTransformReady()', function () {
    it('ignores relative URLs', function () {
        let url = '/my/file.png';
        let root = 'https://example.com';
        absoluteToTransformReady(url, root).should.eql('/my/file.png');
    });

    it('ignores non-matching root domain', function () {
        let url = 'https://different.com/my/file.png';
        let root = 'https://example.com';
        absoluteToTransformReady(url, root).should.eql('https://different.com/my/file.png');
    });

    it('ignores non-matching root subdirectory', function () {
        let url = 'https://example.com/my/file.png';
        let root = 'https://example.com/subdir/';
        absoluteToTransformReady(url, root).should.eql('https://example.com/my/file.png');
    });

    it('ignores non-http protocols', function () {
        let url = 'mailto:test@example.com';
        let root = 'https://example.com';
        absoluteToTransformReady(url, root).should.eql('mailto:test@example.com');
    });

    it('ignores invalid urls', function () {
        let url = 'http://i%20don’t%20believe%20that%20our%20platform%20should%20take%20that%20down%20because%20i%20think%20there%20are%20things%20that%20different%20people%20get%20wrong';
        let root = 'https://example.com';
        absoluteToTransformReady(url, root).should.eql('http://i%20don’t%20believe%20that%20our%20platform%20should%20take%20that%20down%20because%20i%20think%20there%20are%20things%20that%20different%20people%20get%20wrong');
    });

    it('handles unparseable URLs that throw errors', function () {
        // Test URLs that cause URL constructor to throw
        let url = 'http://[invalid';
        let root = 'https://example.com';
        absoluteToTransformReady(url, root).should.eql('http://[invalid');

        url = 'not a valid url at all!!!';
        absoluteToTransformReady(url, root).should.eql('not a valid url at all!!!');
    });

    describe('with matching root', function () {
        it('returns relative file', function () {
            let url = 'https://example.com/my/file.png';
            let root = 'https://example.com';
            absoluteToTransformReady(url, root).should.eql('__GHOST_URL__/my/file.png', 'without root trailing-slash');

            root = 'https://example.com/';
            absoluteToTransformReady(url, root).should.eql('__GHOST_URL__/my/file.png', 'with root trailing-slash');
        });

        it('returns relative directory without trailing-slash', function () {
            let url = 'https://example.com/my';
            let root = 'https://example.com';
            absoluteToTransformReady(url, root).should.eql('__GHOST_URL__/my', 'without root trailing-slash');

            root = 'https://example.com/';
            absoluteToTransformReady(url, root).should.eql('__GHOST_URL__/my', 'with root trailing-slash');
        });

        it('returns relative directory with trailing-slash', function () {
            let url = 'https://example.com/my/';
            let root = 'https://example.com';
            absoluteToTransformReady(url, root).should.eql('__GHOST_URL__/my/', 'without root trailing-slash');

            root = 'https://example.com/';
            absoluteToTransformReady(url, root).should.eql('__GHOST_URL__/my/', 'with root trailing-slash');
        });

        it('keeps query params', function () {
            let url = 'https://example.com/my/file.png?one=1';
            let root = 'https://example.com';
            absoluteToTransformReady(url, root).should.eql('__GHOST_URL__/my/file.png?one=1');
        });

        it('keeps hash param', function () {
            let url = 'https://example.com/my/file.png?one=1#two';
            let root = 'https://example.com';
            absoluteToTransformReady(url, root).should.eql('__GHOST_URL__/my/file.png?one=1#two');
        });
    });

    describe('with matching root + subdir', function () {
        it('returns relative file', function () {
            let url = 'https://example.com/subdir/my/file.png';
            let root = 'https://example.com/subdir';
            absoluteToTransformReady(url, root).should.eql('__GHOST_URL__/my/file.png', 'without root trailing-slash');

            root = 'https://example.com/subdir/';
            absoluteToTransformReady(url, root).should.eql('__GHOST_URL__/my/file.png', 'with root trailing-slash');
        });

        it('returns relative directory without trailing-slash', function () {
            let url = 'https://example.com/subdir/my';
            let root = 'https://example.com/subdir';
            absoluteToTransformReady(url, root).should.eql('__GHOST_URL__/my', 'without root trailing-slash');

            root = 'https://example.com/subdir/';
            absoluteToTransformReady(url, root).should.eql('__GHOST_URL__/my', 'with root trailing-slash');
        });

        it('returns relative directory with trailing-slash', function () {
            let url = 'https://example.com/subdir/my/';
            let root = 'https://example.com/subdir';
            absoluteToTransformReady(url, root).should.eql('__GHOST_URL__/my/', 'without root trailing-slash');

            root = 'https://example.com/subdir/';
            absoluteToTransformReady(url, root).should.eql('__GHOST_URL__/my/', 'with root trailing-slash');
        });
    });

    describe('cdn asset bases', function () {
        const siteUrl = 'https://my-blog.com';
        const mediaCdn = 'https://storage.ghost.io/c/site-uuid';
        const filesCdn = 'https://storage.ghost.io/c/site-uuid';

        it('converts media CDN URLs to transform-ready format', function () {
            const url = 'https://storage.ghost.io/c/site-uuid/content/media/2025/01/video.mp4';
            const result = absoluteToTransformReady(url, siteUrl, {
                staticMediaUrlPrefix: 'content/media',
                mediaBaseUrl: mediaCdn
            });

            result.should.equal('__GHOST_URL__/content/media/2025/01/video.mp4');
        });

        it('converts files CDN URLs to transform-ready format', function () {
            const url = 'https://storage.ghost.io/c/site-uuid/content/files/2025/01/document.pdf';
            const result = absoluteToTransformReady(url, siteUrl, {
                staticFilesUrlPrefix: 'content/files',
                filesBaseUrl: filesCdn
            });

            result.should.equal('__GHOST_URL__/content/files/2025/01/document.pdf');
        });

        it('still converts site-hosted media when CDN base configured', function () {
            const url = 'https://my-blog.com/content/media/2025/01/video.mp4';
            const result = absoluteToTransformReady(url, siteUrl, {
                staticMediaUrlPrefix: 'content/media',
                mediaBaseUrl: mediaCdn
            });

            result.should.equal('__GHOST_URL__/content/media/2025/01/video.mp4');
        });

        it('returns original URL when base does not match', function () {
            const url = 'https://other-storage.ghost.io/c/site-uuid/content/media/2025/01/video.mp4';
            const result = absoluteToTransformReady(url, siteUrl, {
                staticMediaUrlPrefix: 'content/media',
                mediaBaseUrl: mediaCdn
            });

            result.should.equal('https://other-storage.ghost.io/c/site-uuid/content/media/2025/01/video.mp4');
        });
    });

    describe('with no root', function () {
        it('returns relative path from url', function () {
            let url = 'https://example.com/subdir/my/file.png';
            absoluteToTransformReady(url).should.eql('__GHOST_URL__/subdir/my/file.png');
        });

        it('ignores paths', function () {
            let url = '/subdir/my/file.png';
            absoluteToTransformReady(url).should.eql('/subdir/my/file.png');
        });

        it('ignores non-http protocols', function () {
            let url = 'mailto:test@example.com';
            absoluteToTransformReady(url).should.eql('mailto:test@example.com');
        });
    });

    describe('{ignoreProtocol}', function () {
        it('true: ignores protocol', function () {
            let url = 'https://example.com/my/file.png';
            let root = 'http://example.com';
            absoluteToTransformReady(url, root, {ignoreProtocol: true}).should.eql('__GHOST_URL__/my/file.png');
        });

        it('false: requires matching protocol', function () {
            let url = 'https://example.com/my/file.png';
            let root = 'http://example.com';
            absoluteToTransformReady(url, root, {ignoreProtocol: false}).should.eql('https://example.com/my/file.png');
        });

        it('defaults to true', function () {
            let url = 'https://example.com/my/file.png';
            let root = 'http://example.com';
            absoluteToTransformReady(url, root).should.eql('__GHOST_URL__/my/file.png');
        });
    });

    describe('{withoutSubdirectory}', function () {
        it('true: strips subdirectory from returned path', function () {
            let url = 'https://example.com/subdir/my/file.png';
            let root = 'https://example.com/subdir';
            absoluteToTransformReady(url, root, {withoutSubdirectory: true}).should.eql('__GHOST_URL__/my/file.png');
        });

        it('true: does not affect ingoreProtocol default', function () {
            let url = 'https://example.com/subdir/my/file.png';
            let root = 'http://example.com/subdir';
            absoluteToTransformReady(url, root, {withoutSubdirectory: true}).should.eql('__GHOST_URL__/my/file.png');
        });

        it('false: keeps subdirectory in returned path', function () {
            let url = 'https://example.com/subdir/my/file.png';
            let root = 'https://example.com/subdir';
            absoluteToTransformReady(url, root, {withoutSubdirectory: false}).should.eql('__GHOST_URL__/subdir/my/file.png');
        });

        it('defaults to true', function () {
            let url = 'https://example.com/subdir/my/file.png';
            let root = 'https://example.com/subdir';
            absoluteToTransformReady(url, root).should.eql('__GHOST_URL__/my/file.png');
        });
    });

    describe('{assetsOnly}', function () {
        it('skips urls that do not match default assets path', function () {
            let url = 'https://example.com/other/images/file.png';
            let root = 'https://example.com/';
            absoluteToTransformReady(url, root, {assetsOnly: true})
                .should.equal('https://example.com/other/images/file.png');
        });

        it('skips urls that do not match custom assets path', function () {
            let url = 'https://example.com/content/images/file.png';
            let root = 'https://example.com/';
            absoluteToTransformReady(url, root, {assetsOnly: true, staticImageUrlPrefix: 'other/images'})
                .should.equal('https://example.com/content/images/file.png');
        });

        it('transforms urls that match default assets path', function () {
            let url = 'https://example.com/content/images/file.png';
            let root = 'https://example.com/';
            absoluteToTransformReady(url, root, {assetsOnly: true})
                .should.equal('__GHOST_URL__/content/images/file.png');
        });

        it('transforms urls that match custom assets path', function () {
            let url = 'https://example.com/my/files/file.png';
            let root = 'https://example.com/';
            absoluteToTransformReady(url, root, {assetsOnly: true, staticImageUrlPrefix: '/my/files/'})
                .should.equal('__GHOST_URL__/my/files/file.png');
        });

        it('defaults to false', function () {
            let url = 'https://example.com/other/images/file.png';
            let root = 'https://example.com/';
            absoluteToTransformReady(url, root)
                .should.equal('__GHOST_URL__/other/images/file.png');
        });
    });
});

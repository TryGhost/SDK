// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const absoluteToRelative = require('../../../lib/utils/absolute-to-relative');

describe('utils: absoluteToRelative()', function () {
    it('ignores relative URLs', function () {
        let url = '/my/file.png';
        let root = 'https://example.com';
        absoluteToRelative(url, root).should.eql('/my/file.png');
    });

    it('ignores non-matching root domain', function () {
        let url = 'https://different.com/my/file.png';
        let root = 'https://example.com';
        absoluteToRelative(url, root).should.eql('https://different.com/my/file.png');
    });

    it('ignores non-matching root subdirectory', function () {
        let url = 'https://example.com/my/file.png';
        let root = 'https://example.com/subdir/';
        absoluteToRelative(url, root).should.eql('https://example.com/my/file.png');
    });

    it('ignores non-http protocols', function () {
        let url = 'mailto:test@example.com';
        let root = 'https://example.com';
        absoluteToRelative(url, root).should.eql('mailto:test@example.com');
    });

    it('ignores invalid urls', function () {
        let url = 'http://i%20don’t%20believe%20that%20our%20platform%20should%20take%20that%20down%20because%20i%20think%20there%20are%20things%20that%20different%20people%20get%20wrong';
        let root = 'https://example.com';
        absoluteToRelative(url, root).should.eql('http://i%20don’t%20believe%20that%20our%20platform%20should%20take%20that%20down%20because%20i%20think%20there%20are%20things%20that%20different%20people%20get%20wrong');
    });

    describe('with matching root', function () {
        it('returns relative file', function () {
            let url = 'https://example.com/my/file.png';
            let root = 'https://example.com';
            absoluteToRelative(url, root).should.eql('/my/file.png', 'without root trailing-slash');

            root = 'https://example.com/';
            absoluteToRelative(url, root).should.eql('/my/file.png', 'with root trailing-slash');
        });

        it('returns relative directory without trailing-slash', function () {
            let url = 'https://example.com/my';
            let root = 'https://example.com';
            absoluteToRelative(url, root).should.eql('/my', 'without root trailing-slash');

            root = 'https://example.com/';
            absoluteToRelative(url, root).should.eql('/my', 'with root trailing-slash');
        });

        it('returns relative directory with trailing-slash', function () {
            let url = 'https://example.com/my/';
            let root = 'https://example.com';
            absoluteToRelative(url, root).should.eql('/my/', 'without root trailing-slash');

            root = 'https://example.com/';
            absoluteToRelative(url, root).should.eql('/my/', 'with root trailing-slash');
        });

        it('keeps query params', function () {
            let url = 'https://example.com/my/file.png?one=1';
            let root = 'https://example.com';
            absoluteToRelative(url, root).should.eql('/my/file.png?one=1');
        });

        it('keeps hash param', function () {
            let url = 'https://example.com/my/file.png?one=1#two';
            let root = 'https://example.com';
            absoluteToRelative(url, root).should.eql('/my/file.png?one=1#two');
        });
    });

    describe('with matching root + subdir', function () {
        it('returns relative file', function () {
            let url = 'https://example.com/subdir/my/file.png';
            let root = 'https://example.com/subdir';
            absoluteToRelative(url, root).should.eql('/subdir/my/file.png', 'without root trailing-slash');

            root = 'https://example.com/subdir/';
            absoluteToRelative(url, root).should.eql('/subdir/my/file.png', 'with root trailing-slash');
        });

        it('returns relative directory without trailing-slash', function () {
            let url = 'https://example.com/subdir/my';
            let root = 'https://example.com/subdir';
            absoluteToRelative(url, root).should.eql('/subdir/my', 'without root trailing-slash');

            root = 'https://example.com/subdir/';
            absoluteToRelative(url, root).should.eql('/subdir/my', 'with root trailing-slash');
        });

        it('returns relative directory with trailing-slash', function () {
            let url = 'https://example.com/subdir/my/';
            let root = 'https://example.com/subdir';
            absoluteToRelative(url, root).should.eql('/subdir/my/', 'without root trailing-slash');

            root = 'https://example.com/subdir/';
            absoluteToRelative(url, root).should.eql('/subdir/my/', 'with root trailing-slash');
        });
    });

    describe('with no root', function () {
        it('returns relative path from url', function () {
            let url = 'https://example.com/subdir/my/file.png';
            absoluteToRelative(url).should.eql('/subdir/my/file.png');
        });

        it('ignores paths', function () {
            let url = '/subdir/my/file.png';
            absoluteToRelative(url).should.eql('/subdir/my/file.png');
        });

        it('ignores non-http protocols', function () {
            let url = 'mailto:test@example.com';
            absoluteToRelative(url).should.eql('mailto:test@example.com');
        });
    });

    describe('{ignoreProtocol}', function () {
        it('true: ignores protocol', function () {
            let url = 'https://example.com/my/file.png';
            let root = 'http://example.com';
            absoluteToRelative(url, root, {ignoreProtocol: true}).should.eql('/my/file.png');
        });

        it('false: requires matching protocol', function () {
            let url = 'https://example.com/my/file.png';
            let root = 'http://example.com';
            absoluteToRelative(url, root, {ignoreProtocol: false}).should.eql('https://example.com/my/file.png');
        });

        it('defaults to true', function () {
            let url = 'https://example.com/my/file.png';
            let root = 'http://example.com';
            absoluteToRelative(url, root).should.eql('/my/file.png');
        });
    });

    describe('{withoutSubdirectory}', function () {
        it('true: strips subdirectory from returned path', function () {
            let url = 'https://example.com/subdir/my/file.png';
            let root = 'https://example.com/subdir';
            absoluteToRelative(url, root, {withoutSubdirectory: true}).should.eql('/my/file.png');
        });

        it('true: does not affect ingoreProtocol default', function () {
            let url = 'https://example.com/subdir/my/file.png';
            let root = 'http://example.com/subdir';
            absoluteToRelative(url, root, {withoutSubdirectory: true}).should.eql('/my/file.png');
        });

        it('false: keeps subdirectory in returned path', function () {
            let url = 'https://example.com/subdir/my/file.png';
            let root = 'https://example.com/subdir';
            absoluteToRelative(url, root, {withoutSubdirectory: false}).should.eql('/subdir/my/file.png');
        });

        it('defaults to false', function () {
            let url = 'https://example.com/subdir/my/file.png';
            let root = 'https://example.com/subdir';
            absoluteToRelative(url, root).should.eql('/subdir/my/file.png');
        });
    });

    describe('{assetsOnly}', function () {
        it('skips urls that do not match default assets path', function () {
            let url = 'https://example.com/other/images/file.png';
            let root = 'https://example.com/';
            absoluteToRelative(url, root, {assetsOnly: true})
                .should.equal('https://example.com/other/images/file.png');
        });

        it('skips urls that do not match custom assets path', function () {
            let url = 'https://example.com/content/images/file.png';
            let root = 'https://example.com/';
            absoluteToRelative(url, root, {assetsOnly: true, staticImageUrlPrefix: 'other/images'})
                .should.equal('https://example.com/content/images/file.png');
        });

        it('transforms urls that match default assets path', function () {
            let url = 'https://example.com/content/images/file.png';
            let root = 'https://example.com/';
            absoluteToRelative(url, root, {assetsOnly: true})
                .should.equal('/content/images/file.png');
        });

        it('transforms urls that match custom assets path', function () {
            let url = 'https://example.com/my/files/file.png';
            let root = 'https://example.com/';
            absoluteToRelative(url, root, {assetsOnly: true, staticImageUrlPrefix: '/my/files/'})
                .should.equal('/my/files/file.png');
        });
    });
});

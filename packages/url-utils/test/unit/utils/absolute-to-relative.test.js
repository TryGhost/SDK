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
});

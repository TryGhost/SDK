// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const relativeToAbsolute = require('../../../lib/utils/relative-to-absolute');

describe('utils: relativeToAbsolute()', function () {
    it('ignores absolute URLs', function () {
        let url = 'https://different.com/my/file.png';
        let root = 'https://example.com';
        relativeToAbsolute(url, root).should.eql('https://different.com/my/file.png', 'with / root');

        root = 'https://example.com/subdir/';
        relativeToAbsolute(url, root).should.eql('https://different.com/my/file.png', 'with /subdir/ root');
    });

    it('ignores protocol-relative absolute URLs', function () {
        let url = '//mysite.com/my/file.png';
        let root = 'https://example.com';
        relativeToAbsolute(url, root).should.eql('//mysite.com/my/file.png', 'with / root');

        root = 'https://example.com/subdir/';
        relativeToAbsolute(url, root).should.eql('//mysite.com/my/file.png', 'with /subdir/ root');
    });

    it('ignores non-root-relative URLs', function () {
        let url = 'my/file.png';
        let root = 'https://example.com';
        relativeToAbsolute(url, root).should.eql('my/file.png', 'with / root');

        root = 'https://example.com/subdir/';
        relativeToAbsolute(url, root).should.eql('my/file.png', 'with /subdir/ root');
    });

    it('ignores non-http URLs', function () {
        let url = 'tel:12345';
        let root = 'https://example.com';
        relativeToAbsolute(url, root).should.eql('tel:12345', 'with / root');

        root = 'https://example.com/subdir/';
        relativeToAbsolute(url, root).should.eql('tel:12345', 'with /subdir/ root');
    });

    it('ignores hash-param only URLs', function () {
        let url = '#my-title';
        let root = 'https://example.com';
        relativeToAbsolute(url, root).should.eql('#my-title', 'with / root');

        root = 'https://example.com/subdir/';
        relativeToAbsolute(url, root).should.eql('#my-title', 'with /subdir/ root');
    });

    it('ignores query-param only URLs', function () {
        let url = '?test=true';
        let root = 'https://example.com';
        relativeToAbsolute(url, root).should.eql('?test=true', 'with / root');

        root = 'https://example.com/subdir/';
        relativeToAbsolute(url, root).should.eql('?test=true', 'with /subdir/ root');
    });

    describe('with root-relative URL (leading slash)', function () {
        it('returns absolute file', function () {
            let url = '/my/file.png';
            let root = 'https://example.com';
            relativeToAbsolute(url, root).should.eql('https://example.com/my/file.png', 'without root trailing slash');

            root = 'https://example.com/';
            relativeToAbsolute(url, root).should.eql('https://example.com/my/file.png', 'with root trailing slash');

            root = 'https://example.com/subdir';
            relativeToAbsolute(url, root).should.eql('https://example.com/subdir/my/file.png', 'with root subdir without trailing slash');

            root = 'https://example.com/subdir/';
            relativeToAbsolute(url, root).should.eql('https://example.com/subdir/my/file.png', 'with root subdir with trailing slash');
        });

        it('returns absolute directory without trailing slash', function () {
            let url = '/my';
            let root = 'https://example.com';
            relativeToAbsolute(url, root).should.eql('https://example.com/my', 'without root trailing slash');

            root = 'https://example.com/';
            relativeToAbsolute(url, root).should.eql('https://example.com/my', 'with root trailing slash');

            root = 'https://example.com/subdir';
            relativeToAbsolute(url, root).should.eql('https://example.com/subdir/my', 'with root subdir without trailing slash');

            root = 'https://example.com/subdir/';
            relativeToAbsolute(url, root).should.eql('https://example.com/subdir/my', 'with root subdir with trailing slash');
        });

        it('returns absolute directory with trailing slash', function () {
            let url = '/my/';
            let root = 'https://example.com';
            relativeToAbsolute(url, root).should.eql('https://example.com/my/', 'without root trailing slash');

            root = 'https://example.com/';
            relativeToAbsolute(url, root).should.eql('https://example.com/my/', 'with root trailing slash');

            root = 'https://example.com/subdir';
            relativeToAbsolute(url, root).should.eql('https://example.com/subdir/my/', 'with root subdir without trailing slash');

            root = 'https://example.com/subdir/';
            relativeToAbsolute(url, root).should.eql('https://example.com/subdir/my/', 'with root subdir with trailing slash');
        });

        it('keeps query params', function () {
            let url = '/my/file.png?v=1234';
            let root = 'https://example.com';
            relativeToAbsolute(url, root).should.eql('https://example.com/my/file.png?v=1234', 'without root trailing slash');

            root = 'https://example.com/';
            relativeToAbsolute(url, root).should.eql('https://example.com/my/file.png?v=1234', 'with root trailing slash');

            root = 'https://example.com/subdir';
            relativeToAbsolute(url, root).should.eql('https://example.com/subdir/my/file.png?v=1234', 'with root subdir without trailing slash');

            root = 'https://example.com/subdir/';
            relativeToAbsolute(url, root).should.eql('https://example.com/subdir/my/file.png?v=1234', 'with root subdir with trailing slash');
        });

        it('keeps hash param', function () {
            let url = '/my/file.png#1234';
            let root = 'https://example.com';
            relativeToAbsolute(url, root).should.eql('https://example.com/my/file.png#1234', 'without root trailing slash');

            root = 'https://example.com/';
            relativeToAbsolute(url, root).should.eql('https://example.com/my/file.png#1234', 'with root trailing slash');

            root = 'https://example.com/subdir';
            relativeToAbsolute(url, root).should.eql('https://example.com/subdir/my/file.png#1234', 'with root subdir without trailing slash');

            root = 'https://example.com/subdir/';
            relativeToAbsolute(url, root).should.eql('https://example.com/subdir/my/file.png#1234', 'with root subdir with trailing slash');
        });

        it('handles duplicated subdir', function () {
            let url = '/subdir/my/file.png';
            let root = 'https://example.com/subdir/';
            relativeToAbsolute(url, root).should.eql('https://example.com/subdir/my/file.png', 'nested url');

            url = '/subdir/';
            relativeToAbsolute(url, root).should.eql('https://example.com/subdir/', 'top-level url with trailing slash');

            url = '/subdir';
            relativeToAbsolute(url, root).should.eql('https://example.com/subdir/', 'top-level url without trailing slash');

            url = '/subdir/my/file.png';
            root = 'https://example.com/subdir/test/';
            relativeToAbsolute(url, root).should.eql('https://example.com/subdir/test/subdir/my/file.png', 'nested subdir (no match)');

            url = '/sub';
            relativeToAbsolute(url, root).should.eql('https://example.com/subdir/test/sub', 'partial subdir match');
        });

        it('forces https with options.secure = true', function () {
            let url = '/my/file.png';
            let root = 'http://example.com/';

            relativeToAbsolute(url, root).should.eql('http://example.com/my/file.png');
            relativeToAbsolute(url, root, {secure: true}).should.eql('https://example.com/my/file.png');
        });
    });
});

// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const urlJoin = require('../../../lib/utils/url-join');

describe('utils: urlJoin()', function () {
    it('should deduplicate slashes', function () {
        const options = {
            rootUrl: 'http://my-ghost-blog.com/'
        };
        urlJoin(['/', '/my/', '/blog/'], options).should.eql('/my/blog/');
        urlJoin(['/', '//my/', '/blog/'], options).should.eql('/my/blog/');
        urlJoin(['/', '/', '/'], options).should.eql('/');
    });

    it('should not deduplicate slashes in protocol', function () {
        const options = {
            rootUrl: 'http://my-ghost-blog.com/'
        };
        urlJoin(['http://myurl.com', '/rss'], options).should.eql('http://myurl.com/rss');
        urlJoin(['https://myurl.com/', '/rss'], options).should.eql('https://myurl.com/rss');
    });

    it('should permit schemeless protocol', function () {
        const options = {
            rootUrl: 'http://my-ghost-blog.com/'
        };
        urlJoin(['/', '/'], options).should.eql('/');
        urlJoin(['//myurl.com', '/rss'], options).should.eql('//myurl.com/rss');
        urlJoin(['//myurl.com/', '/rss'], options).should.eql('//myurl.com/rss');
        urlJoin(['//myurl.com//', 'rss'], options).should.eql('//myurl.com/rss');
        urlJoin(['', '//myurl.com', 'rss'], options).should.eql('//myurl.com/rss');
    });

    it('should deduplicate subdir', function () {
        let options = {
            rootUrl: 'http://my-ghost-blog.com/blog'
        };
        urlJoin(['/blog/', '/blog'], options).should.eql('/blog/');
        urlJoin(['blog', 'blog/about'], options).should.eql('blog/about');
        urlJoin(['blog/', 'blog/about'], options).should.eql('blog/about');

        options.rootUrl = 'http://my-ghost-blog.com/my/blog';
        urlJoin(['my/blog', 'my/blog/about'], options).should.eql('my/blog/about');
        urlJoin(['my/blog/', 'my/blog/about'], options).should.eql('my/blog/about');
    });

    it('should handle subdir matching tld', function () {
        const options = {
            rootUrl: 'http://ghost.blog/blog'
        };
        urlJoin(['ghost.blog/blog', 'ghost/'], options).should.eql('ghost.blog/blog/ghost/');
        urlJoin(['ghost.blog', 'blog', 'ghost/'], options).should.eql('ghost.blog/blog/ghost/');
    });
});

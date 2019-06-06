// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('./utils');

const sinon = require('sinon');
const moment = require('moment-timezone');
const urlUtils = require('../lib/index');

const constants = {
    ONE_YEAR_S: 31536000
};

describe('Url', function () {
    const defaultAPIVersions = {
        all: ['v0.1', 'v2'],
        v2: {
            admin: 'v2/admin',
            content: 'v2/content',
            members: 'v2/members'
        },
        'v0.1': {
            admin: 'v0.1',
            content: 'v0.1'
        }
    };

    describe('absoluteToRelative', function () {
        it('default', function () {
            urlUtils().absoluteToRelative('http://myblog.com/test/').should.eql('/test/');
        });

        it('with subdir', function () {
            urlUtils().absoluteToRelative('http://myblog.com/blog/test/').should.eql('/blog/test/');
        });

        it('with subdir, but request without', function () {
            const utils = urlUtils({
                url: 'http://myblog.com/blog/'
            });

            utils.absoluteToRelative('http://myblog.com/blog/test/', {withoutSubdirectory: true})
                .should.eql('/test/');
        });

        it('with subdir, but request without', function () {
            const utils = urlUtils({
                url: 'http://myblog.com/blog'
            });
            utils.absoluteToRelative('http://myblog.com/blog/test/', {withoutSubdirectory: true})
                .should.eql('/test/');
        });
    });

    describe('relativeToAbsolute', function () {
        it('default', function () {
            const utils = urlUtils({
                url: 'http://myblog.com/'
            });
            utils.relativeToAbsolute('/test/').should.eql('http://myblog.com/test/');
        });

        it('with subdir', function () {
            const utils = urlUtils({
                url: 'http://myblog.com/blog/'
            });
            utils.relativeToAbsolute('/test/').should.eql('http://myblog.com/blog/test/');
        });

        it('should not convert absolute url', function () {
            urlUtils().relativeToAbsolute('http://anotherblog.com/blog/').should.eql('http://anotherblog.com/blog/');
        });

        it('should not convert absolute url', function () {
            urlUtils().relativeToAbsolute('http://anotherblog.com/blog/').should.eql('http://anotherblog.com/blog/');
        });

        it('should not convert schemeless url', function () {
            urlUtils().relativeToAbsolute('//anotherblog.com/blog/').should.eql('//anotherblog.com/blog/');
        });
    });

    describe('getProtectedSlugs', function () {
        it('defaults', function () {
            const utils = urlUtils({
                url: 'http://my-ghost-blog.com/',
                slugs: {
                    protected: ['ghost', 'rss', 'amp']
                }
            });

            utils.getProtectedSlugs().should.eql(['ghost', 'rss', 'amp']);
        });

        it('url has subdir', function () {
            const utils = urlUtils({
                url: 'http://my-ghost-blog.com/blog',
                slugs: {
                    protected: ['ghost', 'rss', 'amp']
                }
            });

            utils.getProtectedSlugs().should.eql(['ghost', 'rss', 'amp', 'blog']);
        });
    });

    describe('getSubdir', function () {
        it('url has no subdir', function () {
            const utils = urlUtils({
                url: 'http://my-ghost-blog.com/'
            });
            utils.getSubdir().should.eql('');
        });

        it('url has subdir', function () {
            let utils = urlUtils({
                url: 'http://my-ghost-blog.com/blog'
            });
            utils.getSubdir().should.eql('/blog');

            utils = urlUtils({
                url: 'http://my-ghost-blog.com/blog/'
            });
            utils.getSubdir().should.eql('/blog');

            utils = urlUtils({
                url: 'http://my-ghost-blog.com/my/blog'
            });
            utils.getSubdir().should.eql('/my/blog');

            utils = urlUtils({
                url: 'http://my-ghost-blog.com/my/blog/'
            });
            utils.getSubdir().should.eql('/my/blog');
        });

        it('should not return a slash for subdir', function () {
            let utils = urlUtils({
                url: 'http://my-ghost-blog.com'
            });
            utils.getSubdir().should.eql('');

            utils = urlUtils({
                url: 'http://my-ghost-blog.com/'
            });
            utils.getSubdir().should.eql('');
        });
    });

    describe('urlJoin', function () {
        it('should deduplicate slashes', function () {
            const utils = urlUtils({
                url: 'http://my-ghost-blog.com/'
            });
            utils.urlJoin('/', '/my/', '/blog/').should.equal('/my/blog/');
            utils.urlJoin('/', '//my/', '/blog/').should.equal('/my/blog/');
            utils.urlJoin('/', '/', '/').should.equal('/');
        });

        it('should not deduplicate slashes in protocol', function () {
            const utils = urlUtils({
                url: 'http://my-ghost-blog.com/'
            });
            utils.urlJoin('http://myurl.com', '/rss').should.equal('http://myurl.com/rss');
            utils.urlJoin('https://myurl.com/', '/rss').should.equal('https://myurl.com/rss');
        });

        it('should permit schemeless protocol', function () {
            const utils = urlUtils({
                url: 'http://my-ghost-blog.com/'
            });
            utils.urlJoin('/', '/').should.equal('/');
            utils.urlJoin('//myurl.com', '/rss').should.equal('//myurl.com/rss');
            utils.urlJoin('//myurl.com/', '/rss').should.equal('//myurl.com/rss');
            utils.urlJoin('//myurl.com//', 'rss').should.equal('//myurl.com/rss');
            utils.urlJoin('', '//myurl.com', 'rss').should.equal('//myurl.com/rss');
        });

        it('should deduplicate subdir', function () {
            let utils = urlUtils({
                url: 'http://my-ghost-blog.com/blog'
            });
            utils.urlJoin('blog', 'blog/about').should.equal('blog/about');
            utils.urlJoin('blog/', 'blog/about').should.equal('blog/about');

            utils = urlUtils({
                url: 'http://my-ghost-blog.com/my/blog'
            });
            utils.urlJoin('my/blog', 'my/blog/about').should.equal('my/blog/about');
            utils.urlJoin('my/blog/', 'my/blog/about').should.equal('my/blog/about');
        });

        it('should handle subdir matching tld', function () {
            const utils = urlUtils({
                url: 'http://ghost.blog/blog'
            });
            utils.urlJoin('ghost.blog/blog', 'ghost/').should.equal('ghost.blog/blog/ghost/');
            utils.urlJoin('ghost.blog', 'blog', 'ghost/').should.equal('ghost.blog/blog/ghost/');
        });
    });

    describe('urlFor', function () {
        it('should return the home url with no options', function () {
            let utils = urlUtils({
                url: 'http://ghost-blog.com/'
            });
            utils.urlFor().should.equal('/');

            utils = urlUtils({
                url: 'http://my-ghost-blog.com/blog'
            });
            utils.urlFor().should.equal('/blog/');

            utils = urlUtils({
                url: 'http://my-ghost-blog.com/blog/'
            });
            utils.urlFor().should.equal('/blog/');
        });

        it('should return home url when asked for', function () {
            var testContext = 'home';

            let utils = urlUtils({
                url: 'http://my-ghost-blog.com'
            });
            utils.urlFor(testContext).should.equal('/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/');
            utils.urlFor(testContext, {secure: true}, true).should.equal('https://my-ghost-blog.com/');

            utils = urlUtils({
                url: 'http://my-ghost-blog.com/'
            });
            utils.urlFor(testContext).should.equal('/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/');
            utils.urlFor(testContext, {secure: true}, true).should.equal('https://my-ghost-blog.com/');

            utils = urlUtils({
                url: 'http://my-ghost-blog.com/blog'
            });
            utils.urlFor(testContext).should.equal('/blog/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/blog/');
            utils.urlFor(testContext, {secure: true}, true).should.equal('https://my-ghost-blog.com/blog/');

            utils = urlUtils({
                url: 'http://my-ghost-blog.com/blog/'
            });
            utils.urlFor(testContext).should.equal('/blog/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/blog/');
            utils.urlFor(testContext, {secure: true}, true).should.equal('https://my-ghost-blog.com/blog/');

            // Output blog url without trailing slash
            utils = urlUtils({
                url: 'http://my-ghost-blog.com'
            });
            utils.urlFor(testContext).should.equal('/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/');
            utils.urlFor(testContext, {
                secure: true,
                trailingSlash: false
            }, true).should.equal('https://my-ghost-blog.com');

            utils = urlUtils({
                url: 'http://my-ghost-blog.com/'
            });
            utils.urlFor(testContext).should.equal('/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/');
            utils.urlFor(testContext, {
                secure: true,
                trailingSlash: false
            }, true).should.equal('https://my-ghost-blog.com');

            utils = urlUtils({
                url: 'http://my-ghost-blog.com/blog'
            });
            utils.urlFor(testContext).should.equal('/blog/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/blog/');
            utils.urlFor(testContext, {
                secure: true,
                trailingSlash: false
            }, true).should.equal('https://my-ghost-blog.com/blog');

            utils = urlUtils({
                url: 'http://my-ghost-blog.com/blog/'
            });
            utils.urlFor(testContext).should.equal('/blog/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/blog/');
            utils.urlFor(testContext, {
                secure: true,
                trailingSlash: false
            }, true).should.equal('https://my-ghost-blog.com/blog');
        });

        it('should handle weird cases by always returning /', function () {
            const utils = urlUtils({
                url: 'http://ghost-blog.com'
            });
            utils.urlFor('').should.equal('/');
            utils.urlFor('post', {}).should.equal('/');
            utils.urlFor('post', {post: {}}).should.equal('/');
            utils.urlFor(null).should.equal('/');
            utils.urlFor(undefined).should.equal('/');
            utils.urlFor({}).should.equal('/');
            utils.urlFor({relativeUrl: ''}).should.equal('/');
            utils.urlFor({relativeUrl: null}).should.equal('/');
            utils.urlFor({relativeUrl: undefined}).should.equal('/');
        });

        it('should return url for a random path when asked for', function () {
            var testContext = {relativeUrl: '/about/'};

            let utils = urlUtils({
                url: 'http://my-ghost-blog.com'
            });
            utils.urlFor(testContext).should.equal('/about/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/about/');

            utils = urlUtils({
                url: 'http://my-ghost-blog.com/blog'
            });
            utils.urlFor(testContext).should.equal('/blog/about/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/blog/about/');

            testContext.secure = true;
            utils.urlFor(testContext, true).should.equal('https://my-ghost-blog.com/blog/about/');

            testContext.secure = false;
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/blog/about/');

            testContext.secure = false;

            utils = urlUtils({
                url: 'https://my-ghost-blog.com'
            });
            utils.urlFor(testContext, true).should.equal('https://my-ghost-blog.com/about/');
        });

        it('should deduplicate subdirectories in paths', function () {
            var testContext = {relativeUrl: '/blog/about/'};

            let utils = urlUtils({
                url: 'http://my-ghost-blog.com'
            });
            utils.urlFor(testContext).should.equal('/blog/about/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/blog/about/');

            utils = urlUtils({
                url: 'http://my-ghost-blog.com/blog'
            });
            utils.urlFor(testContext).should.equal('/blog/about/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/blog/about/');

            utils = urlUtils({
                url: 'http://my-ghost-blog.com/blog/'
            });
            utils.urlFor(testContext).should.equal('/blog/about/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/blog/about/');
        });

        it('should return url for an image when asked for', function () {
            var testContext = 'image',
                testData;

            let utils = urlUtils({
                url: 'http://my-ghost-blog.com'
            });

            testData = {image: '/content/images/my-image.jpg'};
            utils.urlFor(testContext, testData).should.equal('/content/images/my-image.jpg');
            utils.urlFor(testContext, testData, true).should.equal('http://my-ghost-blog.com/content/images/my-image.jpg');

            testData = {image: 'http://placekitten.com/500/200'};
            utils.urlFor(testContext, testData).should.equal('http://placekitten.com/500/200');
            utils.urlFor(testContext, testData, true).should.equal('http://placekitten.com/500/200');

            testData = {image: '/blog/content/images/my-image2.jpg'};
            utils.urlFor(testContext, testData).should.equal('/blog/content/images/my-image2.jpg');
            // We don't make image urls absolute if they don't look like images relative to the image path
            utils.urlFor(testContext, testData, true).should.equal('/blog/content/images/my-image2.jpg');

            utils = urlUtils({
                url: 'http://my-ghost-blog.com/blog/'
            });

            testData = {image: '/content/images/my-image3.jpg'};
            utils.urlFor(testContext, testData).should.equal('/content/images/my-image3.jpg');
            // We don't make image urls absolute if they don't look like images relative to the image path
            utils.urlFor(testContext, testData, true).should.equal('/content/images/my-image3.jpg');

            testData = {image: '/blog/content/images/my-image4.jpg'};
            utils.urlFor(testContext, testData).should.equal('/blog/content/images/my-image4.jpg');
            utils.urlFor(testContext, testData, true).should.equal('http://my-ghost-blog.com/blog/content/images/my-image4.jpg');

            // Test case for blogs with optional https -
            // they may be configured with http url but the actual connection may be over https (#8373)
            utils = urlUtils({
                url: 'http://my-ghost-blog.com'
            });
            testData = {image: '/content/images/my-image.jpg', secure: true};
            utils.urlFor(testContext, testData, true).should.equal('https://my-ghost-blog.com/content/images/my-image.jpg');
        });

        it('should return a url for a nav item when asked for it', function () {
            var testContext = 'nav',
                testData;

            let utils = urlUtils({
                url: 'http://my-ghost-blog.com'
            });

            testData = {nav: {url: 'http://my-ghost-blog.com/'}};
            utils.urlFor(testContext, testData).should.equal('http://my-ghost-blog.com/');

            testData = {nav: {url: 'http://my-ghost-blog.com/short-and-sweet/'}};
            utils.urlFor(testContext, testData).should.equal('http://my-ghost-blog.com/short-and-sweet/');

            testData = {nav: {url: 'http://my-ghost-blog.com//short-and-sweet/'}, secure: true};
            utils.urlFor(testContext, testData).should.equal('https://my-ghost-blog.com/short-and-sweet/');

            testData = {nav: {url: 'http://my-ghost-blog.com:3000/'}};
            utils.urlFor(testContext, testData).should.equal('http://my-ghost-blog.com:3000/');

            testData = {nav: {url: 'http://my-ghost-blog.com:3000/short-and-sweet/'}};
            utils.urlFor(testContext, testData).should.equal('http://my-ghost-blog.com:3000/short-and-sweet/');

            testData = {nav: {url: 'http://sub.my-ghost-blog.com/'}};
            utils.urlFor(testContext, testData).should.equal('http://sub.my-ghost-blog.com/');

            testData = {nav: {url: '//sub.my-ghost-blog.com/'}};
            utils.urlFor(testContext, testData).should.equal('//sub.my-ghost-blog.com/');

            testData = {nav: {url: 'mailto:sub@my-ghost-blog.com/'}};
            utils.urlFor(testContext, testData).should.equal('mailto:sub@my-ghost-blog.com/');

            testData = {nav: {url: '#this-anchor'}};
            utils.urlFor(testContext, testData).should.equal('#this-anchor');

            testData = {nav: {url: 'http://some-external-page.com/my-ghost-blog.com'}};
            utils.urlFor(testContext, testData).should.equal('http://some-external-page.com/my-ghost-blog.com');

            testData = {nav: {url: 'http://some-external-page.com/stuff-my-ghost-blog.com-around'}};
            utils.urlFor(testContext, testData).should.equal('http://some-external-page.com/stuff-my-ghost-blog.com-around');

            testData = {nav: {url: 'mailto:marshmallow@my-ghost-blog.com'}};
            utils.urlFor(testContext, testData).should.equal('mailto:marshmallow@my-ghost-blog.com');

            utils = urlUtils({
                url: 'http://my-ghost-blog.com/blog'
            });
            testData = {nav: {url: 'http://my-ghost-blog.com/blog/'}};
            utils.urlFor(testContext, testData).should.equal('http://my-ghost-blog.com/blog/');

            testData = {nav: {url: 'http://my-ghost-blog.com/blog/short-and-sweet/'}};
            utils.urlFor(testContext, testData).should.equal('http://my-ghost-blog.com/blog/short-and-sweet/');

            testData = {nav: {url: 'http://my-ghost-blog.com:3000/blog/'}};
            utils.urlFor(testContext, testData).should.equal('http://my-ghost-blog.com:3000/blog/');

            testData = {nav: {url: 'http://my-ghost-blog.com:3000/blog/short-and-sweet/'}};
            utils.urlFor(testContext, testData).should.equal('http://my-ghost-blog.com:3000/blog/short-and-sweet/');

            testData = {nav: {url: 'http://sub.my-ghost-blog.com/blog/'}};
            utils.urlFor(testContext, testData).should.equal('http://sub.my-ghost-blog.com/blog/');

            testData = {nav: {url: '//sub.my-ghost-blog.com/blog/'}};
            utils.urlFor(testContext, testData).should.equal('//sub.my-ghost-blog.com/blog/');
        });

        it('sitemap: should return other known paths when requested', function () {
            const utils = urlUtils({
                url: 'http://my-ghost-blog.com'
            });
            utils.urlFor('sitemap_xsl').should.equal('/sitemap.xsl');
            utils.urlFor('sitemap_xsl', true).should.equal('http://my-ghost-blog.com/sitemap.xsl');
        });

        it('admin: relative', function () {
            const utils = urlUtils({
                url: 'http://my-ghost-blog.com'
            });

            utils.urlFor('admin').should.equal('/ghost/');
        });

        it('admin: url is http', function () {
            const utils = urlUtils({
                url: 'http://my-ghost-blog.com'
            });

            utils.urlFor('admin', true).should.equal('http://my-ghost-blog.com/ghost/');
        });

        it('admin: custom admin url is set', function () {
            const utils = urlUtils({
                url: 'http://my-ghost-blog.com',
                adminUrl: 'https://admin.my-ghost-blog.com'
            });

            utils.urlFor('admin', true).should.equal('https://admin.my-ghost-blog.com/ghost/');
        });

        it('admin: blog is on subdir', function () {
            const utils = urlUtils({
                url: 'http://my-ghost-blog.com/blog'
            });

            utils.urlFor('admin', true).should.equal('http://my-ghost-blog.com/blog/ghost/');
        });

        it('admin: blog is on subdir', function () {
            const utils = urlUtils({
                url: 'http://my-ghost-blog.com/blog/'
            });

            utils.urlFor('admin', true).should.equal('http://my-ghost-blog.com/blog/ghost/');
        });

        it('admin: blog is on subdir', function () {
            const utils = urlUtils({
                url: 'http://my-ghost-blog.com/blog'
            });

            utils.urlFor('admin').should.equal('/blog/ghost/');
        });

        it('admin: blog is on subdir', function () {
            const utils = urlUtils({
                url: 'http://my-ghost-blog.com/blog',
                adminUrl: 'http://something.com'
            });

            utils.urlFor('admin', true).should.equal('http://something.com/blog/ghost/');
        });

        it('admin: blog is on subdir', function () {
            const utils = urlUtils({
                url: 'http://my-ghost-blog.com/blog',
                adminUrl: 'http://something.com/blog'
            });

            utils.urlFor('admin', true).should.equal('http://something.com/blog/ghost/');
        });

        it('admin: blog is on subdir', function () {
            const utils = urlUtils({
                url: 'http://my-ghost-blog.com/blog',
                adminUrl: 'http://something.com/blog/'
            });

            utils.urlFor('admin', true).should.equal('http://something.com/blog/ghost/');
        });

        it('admin: blog is on subdir', function () {
            const utils = urlUtils({
                url: 'http://my-ghost-blog.com/blog/',
                adminUrl: 'http://something.com/blog'
            });

            utils.urlFor('admin', true).should.equal('http://something.com/blog/ghost/');
        });

        ['v0.1', 'v2'].forEach((apiVersion) => {
            function getApiPath(options) {
                const baseAPIPath = '/ghost/api/';

                switch (options.version) {
                case 'v0.1':
                    return `${baseAPIPath}v0.1/`;
                case 'v2':
                    if (options.versionType === 'admin') {
                        return `${baseAPIPath}v2/admin/`;
                    } else {
                        return `${baseAPIPath}v2/content/`;
                    }
                default:
                    return `${baseAPIPath}v0.1/`;
                }
            }

            describe(`for api version: ${apiVersion}`, function () {
                it('api: should return admin url is set', function () {
                    const utils = urlUtils({
                        url: 'http://my-ghost-blog.com',
                        adminUrl: 'https://something.de',
                        apiVersions: defaultAPIVersions
                    });

                    utils
                        .urlFor('api', {version: apiVersion, versionType: 'content'}, true)
                        .should.eql(`https://something.de${getApiPath({version: apiVersion, versionType: 'content'})}`);
                });

                it('api: url has subdir', function () {
                    const utils = urlUtils({
                        url: 'http://my-ghost-blog.com/blog',
                        apiVersions: defaultAPIVersions
                    });

                    utils
                        .urlFor('api', {version: apiVersion, versionType: 'content'}, true)
                        .should.eql(`http://my-ghost-blog.com/blog${getApiPath({version: apiVersion, versionType: 'content'})}`);
                });

                it('api: relative path is correct', function () {
                    const utils = urlUtils({
                        url: 'http://my-ghost-blog.com/',
                        apiVersions: defaultAPIVersions
                    });

                    utils
                        .urlFor('api', {version: apiVersion, versionType: 'content'})
                        .should.eql(getApiPath({version: apiVersion, versionType: 'content'}));
                });

                it('api: relative path with subdir is correct', function () {
                    const utils = urlUtils({
                        url: 'http://my-ghost-blog.com/blog',
                        apiVersions: defaultAPIVersions
                    });

                    utils
                        .urlFor('api', {version: apiVersion, versionType: 'content'})
                        .should.eql(`/blog${getApiPath({version: apiVersion, versionType: 'content'})}`);
                });

                it('api: should return http if config.url is http', function () {
                    const utils = urlUtils({
                        url: 'http://my-ghost-blog.com',
                        apiVersions: defaultAPIVersions
                    });

                    utils
                        .urlFor('api', {version: apiVersion, versionType: 'content'}, true)
                        .should.eql(`http://my-ghost-blog.com${getApiPath({version: apiVersion, versionType: 'content'})}`);
                });

                it('api: should return https if config.url is https', function () {
                    const utils = urlUtils({
                        url: 'https://my-ghost-blog.com',
                        apiVersions: defaultAPIVersions
                    });

                    utils
                        .urlFor('api', {version: apiVersion, versionType: 'content'}, true)
                        .should.eql(`https://my-ghost-blog.com${getApiPath({version: apiVersion, versionType: 'content'})}`);
                });

                it('api: with cors, blog url is http: should return no protocol', function () {
                    const utils = urlUtils({
                        url: 'http://my-ghost-blog.com',
                        apiVersions: defaultAPIVersions
                    });

                    utils
                        .urlFor('api', {cors: true, version: apiVersion, versionType: 'content'}, true)
                        .should.eql(`//my-ghost-blog.com${getApiPath({version: apiVersion, versionType: 'content'})}`);
                });

                it('api: with cors, admin url is http: cors should return no protocol', function () {
                    const utils = urlUtils({
                        url: 'http://my-ghost-blog.com',
                        adminUrl: 'http://admin.ghost.example',
                        apiVersions: defaultAPIVersions
                    });

                    utils
                        .urlFor('api', {cors: true, version: apiVersion, versionType: 'content'}, true)
                        .should.eql(`//admin.ghost.example${getApiPath({version: apiVersion, versionType: 'content'})}`);
                });

                it('api: with cors, admin url is https: should return with protocol', function () {
                    const utils = urlUtils({
                        url: 'https://my-ghost-blog.com',
                        adminUrl: 'https://admin.ghost.example',
                        apiVersions: defaultAPIVersions
                    });

                    utils
                        .urlFor('api', {cors: true, version: apiVersion, versionType: 'content'}, true)
                        .should.eql(`https://admin.ghost.example${getApiPath({version: apiVersion, versionType: 'content'})}`);
                });

                it('api: with cors, blog url is https: should return with protocol', function () {
                    const utils = urlUtils({
                        url: 'https://my-ghost-blog.com',
                        apiVersions: defaultAPIVersions
                    });

                    utils
                        .urlFor('api', {cors: true, version: apiVersion, versionType: 'content'}, true)
                        .should.eql(`https://my-ghost-blog.com${getApiPath({version: apiVersion, versionType: 'content'})}`);
                });

                it('api: with stable version, blog url is https: should return stable content api path', function () {
                    const utils = urlUtils({
                        url: 'https://my-ghost-blog.com',
                        apiVersions: defaultAPIVersions
                    });

                    utils
                        .urlFor('api', {cors: true, version: apiVersion, versionType: 'content'}, true)
                        .should.eql(`https://my-ghost-blog.com${getApiPath({version: apiVersion, versionType: 'content'})}`);
                });

                it('api: with stable version and admin true, blog url is https: should return stable admin api path', function () {
                    const utils = urlUtils({
                        url: 'https://my-ghost-blog.com',
                        apiVersions: defaultAPIVersions
                    });

                    utils
                        .urlFor('api', {cors: true, version: apiVersion, versionType: 'admin'}, true)
                        .should.eql(`https://my-ghost-blog.com${getApiPath({version: apiVersion, versionType: 'admin'})}`);
                });

                it('api: with just version and no version type returns correct api path', function () {
                    const utils = urlUtils({
                        url: 'https://my-ghost-blog.com',
                        apiVersions: defaultAPIVersions
                    });

                    utils
                        .urlFor('api', {cors: true, version: apiVersion}, true)
                        .should.eql(`https://my-ghost-blog.com${getApiPath({version: apiVersion})}`);
                });
            });
        });

        it('api: with active version, blog url is https: should return active content api path', function () {
            const utils = urlUtils({
                url: 'https://my-ghost-blog.com',
                apiVersions: defaultAPIVersions
            });

            utils.urlFor('api', {cors: true, version: 'v2', versionType: 'content'}, true).should.eql('https://my-ghost-blog.com/ghost/api/v2/content/');
        });

        it('api: with active version and admin true, blog url is https: should return active admin api path', function () {
            const utils = urlUtils({
                url: 'https://my-ghost-blog.com',
                apiVersions: defaultAPIVersions
            });

            utils.urlFor('api', {cors: true, version: 'v2', versionType: 'admin'}, true).should.eql('https://my-ghost-blog.com/ghost/api/v2/admin/');
        });
    });

    describe('replacePermalink', function () {
        it('permalink is /:slug/, timezone is default', function () {
            const testData = {
                slug: 'short-and-sweet'
            };
            const postLink = '/short-and-sweet/';

            urlUtils().replacePermalink('/:slug/', testData).should.equal(postLink);
        });

        it('permalink is /:year/:month/:day/:slug/, blog timezone is Los Angeles', function () {
            const testData = {
                slug: 'short-and-sweet',
                published_at: new Date('2016-05-18T06:30:00.000Z')
            };
            const timezone = 'America/Los_Angeles';
            const postLink = '/2016/05/17/short-and-sweet/';

            urlUtils().replacePermalink('/:year/:month/:day/:slug/', testData, timezone).should.equal(postLink);
        });

        it('permalink is /:year/:month/:day/:slug/, blog timezone is Asia Tokyo', function () {
            const testData = {
                slug: 'short-and-sweet',
                published_at: new Date('2016-05-18T06:30:00.000Z')
            };
            const timezone = 'Asia/Tokyo';
            const postLink = '/2016/05/18/short-and-sweet/';

            urlUtils().replacePermalink('/:year/:month/:day/:slug/', testData, timezone).should.equal(postLink);
        });

        it('permalink is /:year/:id/:author/, TZ is LA', function () {
            const testData = {
                id: 3,
                primary_author: {slug: 'joe-blog'},
                slug: 'short-and-sweet',
                published_at: new Date('2016-01-01T00:00:00.000Z')
            };
            const timezone = 'America/Los_Angeles';
            const postLink = '/2015/3/joe-blog/';

            urlUtils().replacePermalink('/:year/:id/:author/', testData, timezone).should.equal(postLink);
        });

        it('permalink is /:year/:id:/:author/, TZ is Berlin', function () {
            const testData = {
                id: 3,
                primary_author: {slug: 'joe-blog'},
                slug: 'short-and-sweet',
                published_at: new Date('2016-01-01T00:00:00.000Z')
            };
            const timezone = 'Europe/Berlin';
            const postLink = '/2016/3/joe-blog/';

            urlUtils().replacePermalink('/:year/:id/:author/', testData, timezone).should.equal(postLink);
        });

        it('permalink is /:primary_tag/:slug/ and there is a primary_tag', function () {
            const testData = {
                slug: 'short-and-sweet',
                primary_tag: {slug: 'bitcoin'}
            };
            const timezone = 'Europe/Berlin';
            const postLink = '/bitcoin/short-and-sweet/';

            urlUtils().replacePermalink('/:primary_tag/:slug/', testData, timezone).should.equal(postLink);
        });

        it('permalink is /:primary_tag/:slug/ and there is NO primary_tag', function () {
            const testData = {
                slug: 'short-and-sweet'
            };
            const timezone = 'Europe/Berlin';
            const postLink = '/all/short-and-sweet/';

            urlUtils().replacePermalink('/:primary_tag/:slug/', testData, timezone).should.equal(postLink);
        });

        it('shows "undefined" for unknown route segments', function () {
            const testData = {
                slug: 'short-and-sweet'
            };
            const timezone = 'Europe/Berlin';
            const postLink = '/undefined/short-and-sweet/';

            urlUtils().replacePermalink('/:tag/:slug/', testData, timezone).should.equal(postLink);
        });

        it('post is not published yet', function () {
            const testData = {
                id: 3,
                slug: 'short-and-sweet',
                published_at: null
            };
            const timezone = 'Europe/London';

            const nowMoment = moment().tz('Europe/London');

            let postLink = '/YYYY/MM/DD/short-and-sweet/';

            postLink = postLink.replace('YYYY', nowMoment.format('YYYY'));
            postLink = postLink.replace('MM', nowMoment.format('MM'));
            postLink = postLink.replace('DD', nowMoment.format('DD'));

            urlUtils().replacePermalink('/:year/:month/:day/:slug/', testData, timezone).should.equal(postLink);
        });
    });

    describe('isSSL', function () {
        it('detects https protocol correctly', function () {
            urlUtils().isSSL('https://my.blog.com').should.be.true();
            urlUtils().isSSL('http://my.blog.com').should.be.false();
            urlUtils().isSSL('http://my.https.com').should.be.false();
        });
    });

    describe('redirects', function () {
        it('performs 301 redirect correctly', function (done) {
            var res = {};
            const utils = urlUtils({
                url: 'http://my-ghost-blog.com',
                redirectCacheMaxAge: constants.ONE_YEAR_S
            });

            res.set = sinon.spy();

            res.redirect = function (code, path) {
                code.should.equal(301);
                path.should.eql('my/awesome/path');
                res.set.calledWith({'Cache-Control': 'public, max-age=' + constants.ONE_YEAR_S}).should.be.true();

                done();
            };

            utils.redirect301(res, 'my/awesome/path');
        });

        it('performs an admin 301 redirect correctly', function (done) {
            var res = {};
            const utils = urlUtils({
                url: 'http://my-ghost-blog.com',
                redirectCacheMaxAge: constants.ONE_YEAR_S
            });

            res.set = sinon.spy();

            res.redirect = function (code, path) {
                code.should.equal(301);
                path.should.eql('/ghost/#/my/awesome/path/');
                res.set.calledWith({'Cache-Control': 'public, max-age=' + constants.ONE_YEAR_S}).should.be.true();

                done();
            };

            utils.redirectToAdmin(301, res, '#/my/awesome/path');
        });

        it('performs an admin 302 redirect correctly', function (done) {
            var res = {};

            const utils = urlUtils({
                url: 'http://my-ghost-blog.com',
                redirectCacheMaxAge: constants.ONE_YEAR_S
            });

            res.set = sinon.spy();

            res.redirect = function (path) {
                path.should.eql('/ghost/#/my/awesome/path/');
                res.set.called.should.be.false();

                done();
            };

            utils.redirectToAdmin(302, res, '#/my/awesome/path');
        });
    });

    describe('make absolute urls ', function () {
        const siteUrl = 'http://my-ghost-blog.com';
        const itemUrl = 'my-awesome-post';

        const utils = urlUtils({
            url: 'http://my-ghost-blog.com'
        });

        it('[success] does not convert absolute URLs', function () {
            var html = '<a href="http://my-ghost-blog.com/content/images" title="Absolute URL">',
                result = utils.makeAbsoluteUrls(html, siteUrl, itemUrl).html();

            result.should.match(/<a href="http:\/\/my-ghost-blog.com\/content\/images" title="Absolute URL">/);
        });
        it('[failure] does not convert protocol relative `//` URLs', function () {
            var html = '<a href="//my-ghost-blog.com/content/images" title="Absolute URL">',
                result = utils.makeAbsoluteUrls(html, siteUrl, itemUrl).html();

            result.should.match(/<a href="\/\/my-ghost-blog.com\/content\/images" title="Absolute URL">/);
        });
        it('[failure] does not convert internal links starting with "#"', function () {
            var html = '<a href="#jumptosection" title="Table of Content">',
                result = utils.makeAbsoluteUrls(html, siteUrl, itemUrl).html();

            result.should.match(/<a href="#jumptosection" title="Table of Content">/);
        });
        it('[success] converts a relative URL', function () {
            var html = '<a href="/about#nowhere" title="Relative URL">',
                result = utils.makeAbsoluteUrls(html, siteUrl, itemUrl).html();

            result.should.match(/<a href="http:\/\/my-ghost-blog.com\/about#nowhere" title="Relative URL">/);
        });
        it('[success] converts a relative URL including subdirectories', function () {
            var html = '<a href="/about#nowhere" title="Relative URL">',
                result = utils.makeAbsoluteUrls(html, 'http://my-ghost-blog.com/blog', itemUrl).html();

            result.should.match(/<a href="http:\/\/my-ghost-blog.com\/blog\/about#nowhere" title="Relative URL">/);
        });

        it('asset urls only', function () {
            let html = '<a href="/about" title="Relative URL"><img src="/content/images/1.jpg">';
            let result = utils.makeAbsoluteUrls(html, siteUrl, itemUrl, {assetsOnly: true}).html();

            result.should.match(/<img src="http:\/\/my-ghost-blog.com\/content\/images\/1.jpg">/);
            result.should.match(/<a href="\/about" title="Relative URL">/);

            html = '<a href="/content/images/09/01/image.jpg">';
            result = utils.makeAbsoluteUrls(html, siteUrl, itemUrl, {assetsOnly: true}).html();

            result.should.match(/<a href="http:\/\/my-ghost-blog.com\/content\/images\/09\/01\/image.jpg">/);

            html = '<a href="/blog/content/images/09/01/image.jpg">';
            result = utils.makeAbsoluteUrls(html, siteUrl, itemUrl, {assetsOnly: true}).html();

            result.should.match(/<a href="http:\/\/my-ghost-blog.com\/blog\/content\/images\/09\/01\/image.jpg">/);

            html = '<img src="http://my-ghost-blog.de/content/images/09/01/image.jpg">';
            result = utils.makeAbsoluteUrls(html, siteUrl, itemUrl, {assetsOnly: true}).html();

            result.should.match(/<img src="http:\/\/my-ghost-blog.de\/content\/images\/09\/01\/image.jpg">/);

            html = '<img src="http://external.com/image.jpg">';
            result = utils.makeAbsoluteUrls(html, siteUrl, itemUrl, {assetsOnly: true}).html();

            result.should.match(/<img src="http:\/\/external.com\/image.jpg">/);
        });
    });
});

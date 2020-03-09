// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../utils');

const sinon = require('sinon');
const UrlUtils = require('../../lib/index');

const constants = {
    ONE_YEAR_S: 31536000
};

describe('UrlUtils', function () {
    let sandbox;

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

    beforeEach(function () {
        sandbox = sinon.createSandbox();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('getSiteUrl', function () {
        it('returns config url', function () {
            const utils = new UrlUtils({
                url: 'http://example.com/'
            });
            utils.getSiteUrl().should.eql('http://example.com/');
        });

        it('adds trailing slash', function () {
            const utils = new UrlUtils({
                url: 'http://example.com'
            });
            utils.getSiteUrl().should.eql('http://example.com/');
        });

        it('returns https if secure=true', function () {
            const utils = new UrlUtils({
                url: 'http://example.com/'
            });
            utils.getSiteUrl(true).should.eql('https://example.com/');
        });
    });

    describe('absoluteToRelative', function () {
        it('calls out to utils/absoluteToRelative', function () {
            const utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/'
            });
            const spy = sandbox.spy(utils._utils, 'absoluteToRelative');

            utils.absoluteToRelative('https://example.com/test/', {test: true});

            const {calledOnce, firstCall} = spy;
            calledOnce.should.be.true('called once');
            firstCall.args[0].should.eql('https://example.com/test/');
            firstCall.args[1].should.eql('http://my-ghost-blog.com/');
            firstCall.args[2].should.deepEqual({test: true});
        });
    });

    describe('relativeToAbsolute', function () {
        it('calls out to utils/relativeToAbsolute', function () {
            const utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/'
            });
            const spy = sandbox.spy(utils._utils, 'relativeToAbsolute');

            utils.relativeToAbsolute('/test/', {test: true});

            const {calledOnce, firstCall} = spy;
            calledOnce.should.be.true('called once');
            firstCall.args[0].should.eql('/test/');
            firstCall.args[1].should.eql('http://my-ghost-blog.com/');
            firstCall.args[2].should.deepEqual({test: true});
        });
    });

    describe('getProtectedSlugs', function () {
        it('defaults', function () {
            const utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/',
                slugs: ['ghost', 'rss', 'amp']
            });

            utils.getProtectedSlugs().should.eql(['ghost', 'rss', 'amp']);
        });

        it('url has subdir', function () {
            const utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/blog',
                slugs: ['ghost', 'rss', 'amp']
            });

            utils.getProtectedSlugs().should.eql(['ghost', 'rss', 'amp', 'blog']);
        });
    });

    describe('getSubdir', function () {
        it('url has no subdir', function () {
            const utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/'
            });
            utils.getSubdir().should.eql('');
        });

        it('url has subdir', function () {
            let utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/blog'
            });
            utils.getSubdir().should.eql('/blog');

            utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/blog/'
            });
            utils.getSubdir().should.eql('/blog');

            utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/my/blog'
            });
            utils.getSubdir().should.eql('/my/blog');

            utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/my/blog/'
            });
            utils.getSubdir().should.eql('/my/blog');
        });

        it('should not return a slash for subdir', function () {
            let utils = new UrlUtils({
                url: 'http://my-ghost-blog.com'
            });
            utils.getSubdir().should.eql('');

            utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/'
            });
            utils.getSubdir().should.eql('');
        });
    });

    describe('urlJoin', function () {
        it('calls out to utils/url-join', function () {
            const utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/'
            });
            const spy = sandbox.spy(utils._utils, 'urlJoin');

            utils.urlJoin('one', 'two');

            const {calledOnce, firstCall} = spy;
            calledOnce.should.be.true('called once');
            firstCall.args[0].should.deepEqual(['one', 'two']);
            firstCall.args[1].should.deepEqual({rootUrl: 'http://my-ghost-blog.com/'});
        });
    });

    describe('urlFor', function () {
        it('should return the home url with no options', function () {
            let utils = new UrlUtils({
                url: 'http://ghost-blog.com/'
            });
            utils.urlFor().should.equal('/');

            utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/blog'
            });
            utils.urlFor().should.equal('/blog/');

            utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/blog/'
            });
            utils.urlFor().should.equal('/blog/');
        });

        it('should return home url when asked for', function () {
            var testContext = 'home';

            let utils = new UrlUtils({
                url: 'http://my-ghost-blog.com'
            });
            utils.urlFor(testContext).should.equal('/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/');
            utils.urlFor(testContext, {secure: true}, true).should.equal('https://my-ghost-blog.com/');

            utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/'
            });
            utils.urlFor(testContext).should.equal('/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/');
            utils.urlFor(testContext, {secure: true}, true).should.equal('https://my-ghost-blog.com/');

            utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/blog'
            });
            utils.urlFor(testContext).should.equal('/blog/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/blog/');
            utils.urlFor(testContext, {secure: true}, true).should.equal('https://my-ghost-blog.com/blog/');

            utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/blog/'
            });
            utils.urlFor(testContext).should.equal('/blog/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/blog/');
            utils.urlFor(testContext, {secure: true}, true).should.equal('https://my-ghost-blog.com/blog/');

            // Output blog url without trailing slash
            utils = new UrlUtils({
                url: 'http://my-ghost-blog.com'
            });
            utils.urlFor(testContext).should.equal('/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/');
            utils.urlFor(testContext, {
                secure: true,
                trailingSlash: false
            }, true).should.equal('https://my-ghost-blog.com');

            utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/'
            });
            utils.urlFor(testContext).should.equal('/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/');
            utils.urlFor(testContext, {
                secure: true,
                trailingSlash: false
            }, true).should.equal('https://my-ghost-blog.com');

            utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/blog'
            });
            utils.urlFor(testContext).should.equal('/blog/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/blog/');
            utils.urlFor(testContext, {
                secure: true,
                trailingSlash: false
            }, true).should.equal('https://my-ghost-blog.com/blog');

            utils = new UrlUtils({
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
            const utils = new UrlUtils({
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

            let utils = new UrlUtils({
                url: 'http://my-ghost-blog.com'
            });
            utils.urlFor(testContext).should.equal('/about/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/about/');

            utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/blog'
            });
            utils.urlFor(testContext).should.equal('/blog/about/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/blog/about/');

            testContext.secure = true;
            utils.urlFor(testContext, true).should.equal('https://my-ghost-blog.com/blog/about/');

            testContext.secure = false;
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/blog/about/');

            testContext.secure = false;

            utils = new UrlUtils({
                url: 'https://my-ghost-blog.com'
            });
            utils.urlFor(testContext, true).should.equal('https://my-ghost-blog.com/about/');
        });

        it('should deduplicate subdirectories in paths', function () {
            var testContext = {relativeUrl: '/blog/about/'};

            let utils = new UrlUtils({
                url: 'http://my-ghost-blog.com'
            });
            utils.urlFor(testContext).should.equal('/blog/about/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/blog/about/');

            utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/blog'
            });
            utils.urlFor(testContext).should.equal('/blog/about/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/blog/about/');

            utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/blog/'
            });
            utils.urlFor(testContext).should.equal('/blog/about/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/blog/about/');
        });

        it('should return url for an image when asked for', function () {
            var testContext = 'image',
                testData;

            let utils = new UrlUtils({
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

            utils = new UrlUtils({
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
            utils = new UrlUtils({
                url: 'http://my-ghost-blog.com'
            });
            testData = {image: '/content/images/my-image.jpg', secure: true};
            utils.urlFor(testContext, testData, true).should.equal('https://my-ghost-blog.com/content/images/my-image.jpg');
        });

        it('should return a url for a nav item when asked for it', function () {
            var testContext = 'nav',
                testData;

            let utils = new UrlUtils({
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

            utils = new UrlUtils({
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
            const utils = new UrlUtils({
                url: 'http://my-ghost-blog.com'
            });
            utils.urlFor('sitemap_xsl').should.equal('/sitemap.xsl');
            utils.urlFor('sitemap_xsl', true).should.equal('http://my-ghost-blog.com/sitemap.xsl');
        });

        it('admin: relative', function () {
            const utils = new UrlUtils({
                url: 'http://my-ghost-blog.com'
            });

            utils.urlFor('admin').should.equal('/ghost/');
        });

        it('admin: url is http', function () {
            const utils = new UrlUtils({
                url: 'http://my-ghost-blog.com'
            });

            utils.urlFor('admin', true).should.equal('http://my-ghost-blog.com/ghost/');
        });

        it('admin: custom admin url is set', function () {
            const utils = new UrlUtils({
                url: 'http://my-ghost-blog.com',
                adminUrl: 'https://admin.my-ghost-blog.com'
            });

            utils.urlFor('admin', true).should.equal('https://admin.my-ghost-blog.com/ghost/');
        });

        it('admin: blog is on subdir (absolute, no trailing slash)', function () {
            const utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/blog'
            });

            utils.urlFor('admin', true).should.equal('http://my-ghost-blog.com/blog/ghost/');
        });

        it('admin: blog is on subdir (absolute, trailing slash)', function () {
            const utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/blog/'
            });

            utils.urlFor('admin', true).should.equal('http://my-ghost-blog.com/blog/ghost/');
        });

        it('admin: blog is on subdir (relative, no trailing slash)', function () {
            const utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/blog'
            });

            utils.urlFor('admin').should.equal('/blog/ghost/');
        });

        it('admin: blog is on subdir (separate admin, absolute, no trailing slash)', function () {
            const utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/blog',
                adminUrl: 'http://something.com'
            });

            utils.urlFor('admin', true).should.equal('http://something.com/blog/ghost/');
        });

        it('admin: blog is on subdir (separate admin with subdir, absolute, no trailing slash)', function () {
            const utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/blog',
                adminUrl: 'http://something.com/blog'
            });

            utils.urlFor('admin', true).should.equal('http://something.com/blog/ghost/');
        });

        it('admin: blog is on subdir (separate admin with subdir, absolute, trailing slash)', function () {
            const utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/blog',
                adminUrl: 'http://something.com/blog/'
            });

            utils.urlFor('admin', true).should.equal('http://something.com/blog/ghost/');
        });

        it('admin: blog is on subdir (separate admin with subdir, absolute, no trailing admin slash)', function () {
            const utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/blog/',
                adminUrl: 'http://something.com/blog'
            });

            utils.urlFor('admin', true).should.equal('http://something.com/blog/ghost/');
        });

        // eslint-disable-next-line
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
                    const utils = new UrlUtils({
                        url: 'http://my-ghost-blog.com',
                        adminUrl: 'https://something.de',
                        apiVersions: defaultAPIVersions
                    });

                    utils
                        .urlFor('api', {version: apiVersion, versionType: 'content'}, true)
                        .should.eql(`https://something.de${getApiPath({version: apiVersion, versionType: 'content'})}`);
                });

                it('api: url has subdir', function () {
                    const utils = new UrlUtils({
                        url: 'http://my-ghost-blog.com/blog',
                        apiVersions: defaultAPIVersions
                    });

                    utils
                        .urlFor('api', {version: apiVersion, versionType: 'content'}, true)
                        .should.eql(`http://my-ghost-blog.com/blog${getApiPath({version: apiVersion, versionType: 'content'})}`);
                });

                it('api: relative path is correct', function () {
                    const utils = new UrlUtils({
                        url: 'http://my-ghost-blog.com/',
                        apiVersions: defaultAPIVersions
                    });

                    utils
                        .urlFor('api', {version: apiVersion, versionType: 'content'})
                        .should.eql(getApiPath({version: apiVersion, versionType: 'content'}));
                });

                it('api: relative path with subdir is correct', function () {
                    const utils = new UrlUtils({
                        url: 'http://my-ghost-blog.com/blog',
                        apiVersions: defaultAPIVersions
                    });

                    utils
                        .urlFor('api', {version: apiVersion, versionType: 'content'})
                        .should.eql(`/blog${getApiPath({version: apiVersion, versionType: 'content'})}`);
                });

                it('api: should return http if config.url is http', function () {
                    const utils = new UrlUtils({
                        url: 'http://my-ghost-blog.com',
                        apiVersions: defaultAPIVersions
                    });

                    utils
                        .urlFor('api', {version: apiVersion, versionType: 'content'}, true)
                        .should.eql(`http://my-ghost-blog.com${getApiPath({version: apiVersion, versionType: 'content'})}`);
                });

                it('api: should return https if config.url is https', function () {
                    const utils = new UrlUtils({
                        url: 'https://my-ghost-blog.com',
                        apiVersions: defaultAPIVersions
                    });

                    utils
                        .urlFor('api', {version: apiVersion, versionType: 'content'}, true)
                        .should.eql(`https://my-ghost-blog.com${getApiPath({version: apiVersion, versionType: 'content'})}`);
                });

                it('api: with cors, blog url is http: should return no protocol', function () {
                    const utils = new UrlUtils({
                        url: 'http://my-ghost-blog.com',
                        apiVersions: defaultAPIVersions
                    });

                    utils
                        .urlFor('api', {cors: true, version: apiVersion, versionType: 'content'}, true)
                        .should.eql(`//my-ghost-blog.com${getApiPath({version: apiVersion, versionType: 'content'})}`);
                });

                it('api: with cors, admin url is http: cors should return no protocol', function () {
                    const utils = new UrlUtils({
                        url: 'http://my-ghost-blog.com',
                        adminUrl: 'http://admin.ghost.example',
                        apiVersions: defaultAPIVersions
                    });

                    utils
                        .urlFor('api', {cors: true, version: apiVersion, versionType: 'content'}, true)
                        .should.eql(`//admin.ghost.example${getApiPath({version: apiVersion, versionType: 'content'})}`);
                });

                it('api: with cors, admin url is https: should return with protocol', function () {
                    const utils = new UrlUtils({
                        url: 'https://my-ghost-blog.com',
                        adminUrl: 'https://admin.ghost.example',
                        apiVersions: defaultAPIVersions
                    });

                    utils
                        .urlFor('api', {cors: true, version: apiVersion, versionType: 'content'}, true)
                        .should.eql(`https://admin.ghost.example${getApiPath({version: apiVersion, versionType: 'content'})}`);
                });

                it('api: with cors, blog url is https: should return with protocol', function () {
                    const utils = new UrlUtils({
                        url: 'https://my-ghost-blog.com',
                        apiVersions: defaultAPIVersions
                    });

                    utils
                        .urlFor('api', {cors: true, version: apiVersion, versionType: 'content'}, true)
                        .should.eql(`https://my-ghost-blog.com${getApiPath({version: apiVersion, versionType: 'content'})}`);
                });

                it('api: with stable version, blog url is https: should return stable content api path', function () {
                    const utils = new UrlUtils({
                        url: 'https://my-ghost-blog.com',
                        apiVersions: defaultAPIVersions
                    });

                    utils
                        .urlFor('api', {cors: true, version: apiVersion, versionType: 'content'}, true)
                        .should.eql(`https://my-ghost-blog.com${getApiPath({version: apiVersion, versionType: 'content'})}`);
                });

                it('api: with stable version and admin true, blog url is https: should return stable admin api path', function () {
                    const utils = new UrlUtils({
                        url: 'https://my-ghost-blog.com',
                        apiVersions: defaultAPIVersions
                    });

                    utils
                        .urlFor('api', {cors: true, version: apiVersion, versionType: 'admin'}, true)
                        .should.eql(`https://my-ghost-blog.com${getApiPath({version: apiVersion, versionType: 'admin'})}`);
                });

                it('api: with just version and no version type returns correct api path', function () {
                    const utils = new UrlUtils({
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
            const utils = new UrlUtils({
                url: 'https://my-ghost-blog.com',
                apiVersions: defaultAPIVersions
            });

            utils.urlFor('api', {cors: true, version: 'v2', versionType: 'content'}, true).should.eql('https://my-ghost-blog.com/ghost/api/v2/content/');
        });

        it('api: with active version and admin true, blog url is https: should return active admin api path', function () {
            const utils = new UrlUtils({
                url: 'https://my-ghost-blog.com',
                apiVersions: defaultAPIVersions
            });

            utils.urlFor('api', {cors: true, version: 'v2', versionType: 'admin'}, true).should.eql('https://my-ghost-blog.com/ghost/api/v2/admin/');
        });
    });

    describe('replacePermalink', function () {
        it('calls outs to utils/replace-permalink', function () {
            const utils = new UrlUtils();
            const spy = sandbox.spy(utils._utils, 'replacePermalink');

            utils.replacePermalink('testPermalink', 'testResource', 'testTimezone');

            const {calledOnce, firstCall} = spy;
            calledOnce.should.be.true('called once');
            firstCall.args[0].should.eql('testPermalink');
            firstCall.args[1].should.eql('testResource');
            firstCall.args[2].should.eql('testTimezone');
        });
    });

    describe('isSSL', function () {
        it('works', function () {
            const utils = new UrlUtils({
                url: 'http://my-ghost-blog.com/'
            });

            utils.isSSL('https://example.com').should.be.true;
            utils.isSSL('http://example.com').should.be.false;
        });
    });

    describe('redirects', function () {
        it('performs 301 redirect correctly', function (done) {
            var res = {};
            const utils = new UrlUtils({
                url: 'http://my-ghost-blog.com',
                redirectCacheMaxAge: constants.ONE_YEAR_S
            });

            res.set = sandbox.spy();

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
            const utils = new UrlUtils({
                url: 'http://my-ghost-blog.com',
                redirectCacheMaxAge: constants.ONE_YEAR_S
            });

            res.set = sandbox.spy();

            res.redirect = function (code, path) {
                code.should.equal(301);
                path.should.eql('http://my-ghost-blog.com/ghost/#/my/awesome/path/');
                res.set.calledWith({'Cache-Control': 'public, max-age=' + constants.ONE_YEAR_S}).should.be.true();

                done();
            };

            utils.redirectToAdmin(301, res, '#/my/awesome/path');
        });

        it('performs an admin 302 redirect correctly', function (done) {
            var res = {};

            const utils = new UrlUtils({
                url: 'http://my-ghost-blog.com',
                redirectCacheMaxAge: constants.ONE_YEAR_S
            });

            res.set = sandbox.spy();

            res.redirect = function (path) {
                path.should.eql('http://my-ghost-blog.com/ghost/#/my/awesome/path/');
                res.set.called.should.be.false();

                done();
            };

            utils.redirectToAdmin(302, res, '#/my/awesome/path');
        });

        it('performs and admin redirect to a custom admin url correctly', function (done) {
            var res = {};
            const utils = new UrlUtils({
                url: 'http://my-ghost-blog.com',
                adminUrl: 'https://admin.myblog.com',
                redirectCacheMaxAge: constants.ONE_YEAR_S
            });

            res.set = sandbox.spy();

            res.redirect = function (code, path) {
                code.should.equal(301);
                path.should.eql('https://admin.myblog.com/ghost/#/my/awesome/path/');
                res.set.calledWith({'Cache-Control': 'public, max-age=' + constants.ONE_YEAR_S}).should.be.true();

                done();
            };

            utils.redirectToAdmin(301, res, '#/my/awesome/path');
        });
    });

    describe('htmlRelativeToAbsolute ', function () {
        it('calls out to utils/html-relative-to-absolute', function () {
            const utils = new UrlUtils({
                url: 'https://example.com',
                staticImageUrlPrefix: 'static/images'
            });
            const spy = sandbox.spy(utils._utils, 'htmlRelativeToAbsolute');

            utils.htmlRelativeToAbsolute('html', 'my-awesome-post', {secure: true});

            const {calledOnce, firstCall} = spy;
            calledOnce.should.be.true('called once');
            firstCall.args[0].should.eql('html');
            firstCall.args[1].should.eql('https://example.com/');
            firstCall.args[2].should.eql('my-awesome-post');
            firstCall.args[3].should.deepEqual({
                assetsOnly: false,
                staticImageUrlPrefix: 'static/images',
                secure: true
            });
        });

        it('correctly passes through options with no itemPath', function () {
            const utils = new UrlUtils({
                url: 'https://example.com',
                staticImageUrlPrefix: 'static/images'
            });
            const spy = sandbox.spy(utils._utils, 'htmlRelativeToAbsolute');

            utils.htmlRelativeToAbsolute('html', {secure: true});

            const {calledOnce, firstCall} = spy;
            calledOnce.should.be.true('called once');
            firstCall.args[0].should.eql('html');
            firstCall.args[1].should.eql('https://example.com/');
            should.not.exist(firstCall.args[2]);
            firstCall.args[3].should.deepEqual({
                assetsOnly: false,
                staticImageUrlPrefix: 'static/images',
                secure: true
            });
        });
    });

    describe('htmlAbsoluteToRelative', function () {
        it('calls out to utils/html-absolute-to-relative', function () {
            const utils = new UrlUtils({
                url: 'https://example.com',
                staticImageUrlPrefix: 'static/images'
            });
            const spy = sandbox.spy(utils._utils, 'htmlAbsoluteToRelative');

            utils.htmlAbsoluteToRelative('html');

            const {calledOnce, firstCall} = spy;
            calledOnce.should.be.true('called once');
            firstCall.args[0].should.eql('html');
            firstCall.args[1].should.eql('https://example.com/');
            firstCall.args[2].should.deepEqual({
                assetsOnly: false,
                staticImageUrlPrefix: 'static/images'
            });
        });
    });

    describe('markdownRelativeToAbsolute', function () {
        it('calls out to utils/markdown-relative-to-absolute', function () {
            const utils = new UrlUtils({
                url: 'https://example.com',
                staticImageUrlPrefix: 'static/images'
            });
            const spy = sandbox.spy(utils._utils, 'markdownRelativeToAbsolute');

            utils.markdownRelativeToAbsolute('markdown', 'my-awesome-post', {secure: true});

            const {calledOnce, firstCall} = spy;
            calledOnce.should.be.true('called once');
            firstCall.args[0].should.eql('markdown');
            firstCall.args[1].should.eql('https://example.com/');
            firstCall.args[2].should.eql('my-awesome-post');
            firstCall.args[3].should.deepEqual({
                assetsOnly: false,
                staticImageUrlPrefix: 'static/images',
                secure: true
            });
        });

        it('correctly passes through options with no itemPath', function () {
            const utils = new UrlUtils({
                url: 'https://example.com',
                staticImageUrlPrefix: 'static/images'
            });
            const spy = sandbox.spy(utils._utils, 'markdownRelativeToAbsolute');

            utils.markdownRelativeToAbsolute('markdown', {secure: true});

            const {calledOnce, firstCall} = spy;
            calledOnce.should.be.true('called once');
            firstCall.args[0].should.eql('markdown');
            firstCall.args[1].should.eql('https://example.com/');
            should.not.exist(firstCall.args[2]);
            firstCall.args[3].should.deepEqual({
                assetsOnly: false,
                staticImageUrlPrefix: 'static/images',
                secure: true
            });
        });
    });

    describe('markdownAbsoluteToRelative', function () {
        it('calls out to utils/markdown-absolute-to-relative', function () {
            const utils = new UrlUtils({
                url: 'https://example.com',
                staticImageUrlPrefix: 'static/images'
            });
            const spy = sandbox.spy(utils._utils, 'markdownAbsoluteToRelative');

            utils.markdownAbsoluteToRelative('markdown', {assetsOnly: true});

            const {calledOnce, firstCall} = spy;
            calledOnce.should.be.true('called once');
            firstCall.args[0].should.eql('markdown');
            firstCall.args[1].should.eql('https://example.com/');
            firstCall.args[2].should.deepEqual({
                assetsOnly: true,
                staticImageUrlPrefix: 'static/images'
            });
        });
    });

    describe('mobiledocRelativeToAbsolute', function () {
        it('calls out to utils/mobiledoc-relative-to-absolute', function () {
            const utils = new UrlUtils({
                url: 'https://example.com',
                staticImageUrlPrefix: 'static/images'
            });
            const stub = sandbox.stub(utils._utils, 'mobiledocRelativeToAbsolute');

            const cards = [{name: 'test'}];
            utils.mobiledocRelativeToAbsolute('serializedMobiledoc', 'my-awesome-post', {assetsOnly: true, cards});

            const {calledOnce, firstCall} = stub;
            calledOnce.should.be.true('called once');
            firstCall.args[0].should.eql('serializedMobiledoc');
            firstCall.args[1].should.eql('https://example.com/');
            firstCall.args[2].should.eql('my-awesome-post');
            firstCall.args[3].should.deepEqual({
                assetsOnly: true,
                staticImageUrlPrefix: 'static/images',
                cards
            });
        });

        it('correctly passes through options with no itemPath', function () {
            const utils = new UrlUtils({
                url: 'https://example.com',
                staticImageUrlPrefix: 'static/images'
            });
            const stub = sandbox.stub(utils._utils, 'mobiledocRelativeToAbsolute');

            const cards = [{name: 'test'}];
            utils.mobiledocRelativeToAbsolute('serializedMobiledoc', {cards, secure: true});

            const {calledOnce, firstCall} = stub;
            calledOnce.should.be.true('called once');
            firstCall.args[0].should.eql('serializedMobiledoc');
            firstCall.args[1].should.eql('https://example.com/');
            should.not.exist(firstCall.args[2]);
            firstCall.args[3].should.deepEqual({
                assetsOnly: false,
                staticImageUrlPrefix: 'static/images',
                secure: true,
                cards
            });
        });
    });

    describe('mobiledocAbsoluteToRelative', function () {
        it('calls out to utils/mobiledoc-absolute-to-relative', function () {
            const utils = new UrlUtils({
                url: 'https://example.com',
                staticImageUrlPrefix: 'static/images'
            });
            const stub = sandbox.stub(utils._utils, 'mobiledocAbsoluteToRelative');

            const cards = [{name: 'test'}];
            utils.mobiledocAbsoluteToRelative('serializedMobiledoc', {assetsOnly: true, cards});

            const {calledOnce, firstCall} = stub;
            calledOnce.should.be.true('called once');
            firstCall.args[0].should.eql('serializedMobiledoc');
            firstCall.args[1].should.eql('https://example.com/');
            firstCall.args[2].should.deepEqual({
                assetsOnly: true,
                staticImageUrlPrefix: 'static/images',
                cards
            });
        });
    });
});

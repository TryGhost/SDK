// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../utils');
const assert = require('assert/strict');

const sinon = require('sinon');
const UrlUtils = require('../../lib/UrlUtils');
const configUrlHelpers = require('@tryghost/config-url-helpers');

const constants = {
    ONE_YEAR_S: 31536000
};

const fakeConfig = {
    url: '',
    adminUrl: null
};

let utils;
let nconf;

describe('UrlUtils', function () {
    let sandbox;

    before(function () {
        const configFaker = (arg) => {
            if (arg === 'url') {
                return fakeConfig.url;
            } else if (arg === 'admin:url') {
                return fakeConfig.adminUrl;
            }
        };

        nconf = {
            get: sinon.stub().callsFake(configFaker)
        };

        configUrlHelpers.bindAll(nconf);
    });

    beforeEach(function () {
        sandbox = sinon.createSandbox();

        fakeConfig.url = 'http://my-ghost-blog.com/';
        fakeConfig.adminUrl = null;

        utils = new UrlUtils({
            getSubdir: nconf.getSubdir,
            getSiteUrl: nconf.getSiteUrl,
            getAdminUrl: nconf.getAdminUrl,
            apiVersions: {},
            slugs: ['ghost', 'rss', 'amp'],
            redirectCacheMaxAge: constants.ONE_YEAR_S
        });
    });

    describe('static url prefixes', function () {
        it('exposes static defaults and ignores overrides', function () {
            utils.STATIC_IMAGE_URL_PREFIX.should.eql('content/images');
            utils.STATIC_FILES_URL_PREFIX.should.eql('content/files');
            utils.STATIC_MEDIA_URL_PREFIX.should.eql('content/media');

            const customUtils = new UrlUtils({
                getSubdir: nconf.getSubdir,
                getSiteUrl: nconf.getSiteUrl,
                getAdminUrl: nconf.getAdminUrl,
                apiVersions: {},
                slugs: ['ghost', 'rss', 'amp'],
                redirectCacheMaxAge: constants.ONE_YEAR_S,
                staticImageUrlPrefix: 'static/images',
                staticFilesUrlPrefix: 'static/files',
                staticMediaUrlPrefix: 'static/media'
            });

            customUtils.STATIC_IMAGE_URL_PREFIX.should.eql('content/images');
            customUtils.STATIC_FILES_URL_PREFIX.should.eql('content/files');
            customUtils.STATIC_MEDIA_URL_PREFIX.should.eql('content/media');
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('absoluteToRelative', function () {
        it('calls out to utils/absoluteToRelative', function () {
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
            utils.getProtectedSlugs().should.eql(['ghost', 'rss', 'amp']);
        });

        it('url has subdir', function () {
            fakeConfig.url = 'http://my-ghost-blog.com/blog';

            utils.getProtectedSlugs().should.eql(['ghost', 'rss', 'amp', 'blog']);
        });
    });

    describe('urlJoin', function () {
        it('calls out to utils/url-join', function () {
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
            utils.urlFor().should.equal('/');

            fakeConfig.url = 'http://my-ghost-blog.com/blog';
            utils.urlFor().should.equal('/blog/');

            fakeConfig.url = 'http://my-ghost-blog.com/blog/';
            utils.urlFor().should.equal('/blog/');
        });

        it('should return home url when asked for', function () {
            var testContext = 'home';

            fakeConfig.url = 'http://my-ghost-blog.com';
            utils.urlFor(testContext).should.equal('/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/');

            fakeConfig.url = 'http://my-ghost-blog.com/';
            utils.urlFor(testContext).should.equal('/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/');

            fakeConfig.url = 'http://my-ghost-blog.com/blog';
            utils.urlFor(testContext).should.equal('/blog/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/blog/');

            fakeConfig.url = 'http://my-ghost-blog.com/blog/';
            utils.urlFor(testContext).should.equal('/blog/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/blog/');

            // Output blog url without trailing slash
            fakeConfig.url = 'http://my-ghost-blog.com';
            utils.urlFor(testContext).should.equal('/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/');

            fakeConfig.url = 'http://my-ghost-blog.com/';
            utils.urlFor(testContext).should.equal('/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/');

            fakeConfig.url = 'http://my-ghost-blog.com/blog';
            utils.urlFor(testContext).should.equal('/blog/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/blog/');

            fakeConfig.url = 'http://my-ghost-blog.com/blog/';
            utils.urlFor(testContext).should.equal('/blog/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/blog/');
        });

        it('should handle weird cases by always returning /', function () {
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

            utils.urlFor(testContext).should.equal('/about/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/about/');

            fakeConfig.url = 'http://my-ghost-blog.com/blog';
            utils.urlFor(testContext).should.equal('/blog/about/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/blog/about/');

            fakeConfig.url = 'https://my-ghost-blog.com';
            utils.urlFor(testContext, true).should.equal('https://my-ghost-blog.com/about/');
        });

        it('should deduplicate subdirectories in paths', function () {
            var testContext = {relativeUrl: '/blog/about/'};

            utils.urlFor(testContext).should.equal('/blog/about/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/blog/about/');

            fakeConfig.url = 'http://my-ghost-blog.com/blog';
            utils.urlFor(testContext).should.equal('/blog/about/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/blog/about/');

            fakeConfig.url = 'http://my-ghost-blog.com/blog/';
            utils.urlFor(testContext).should.equal('/blog/about/');
            utils.urlFor(testContext, true).should.equal('http://my-ghost-blog.com/blog/about/');
        });

        it('should return url for an image when asked for', function () {
            var testContext = 'image',
                testData;

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

            fakeConfig.url = 'http://my-ghost-blog.com/blog/';
            testData = {image: '/content/images/my-image3.jpg'};
            utils.urlFor(testContext, testData).should.equal('/content/images/my-image3.jpg');
            // We don't make image urls absolute if they don't look like images relative to the image path
            utils.urlFor(testContext, testData, true).should.equal('/content/images/my-image3.jpg');

            testData = {image: '/blog/content/images/my-image4.jpg'};
            utils.urlFor(testContext, testData).should.equal('/blog/content/images/my-image4.jpg');
            utils.urlFor(testContext, testData, true).should.equal('http://my-ghost-blog.com/blog/content/images/my-image4.jpg');
        });

        it('should return a url for a nav item when asked for it', function () {
            var testContext = 'nav',
                testData;

            testData = {nav: {url: 'http://my-ghost-blog.com/'}};
            utils.urlFor(testContext, testData).should.equal('http://my-ghost-blog.com/');

            testData = {nav: {url: 'http://my-ghost-blog.com/short-and-sweet/'}};
            utils.urlFor(testContext, testData).should.equal('http://my-ghost-blog.com/short-and-sweet/');

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

            fakeConfig.url = 'http://my-ghost-blog.com/blog';
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
            utils.urlFor('sitemap_xsl').should.equal('/sitemap.xsl');
            utils.urlFor('sitemap_xsl', true).should.equal('http://my-ghost-blog.com/sitemap.xsl');
        });

        describe('admin', function () {
            it('relative', function () {
                utils.urlFor('admin').should.equal('/ghost/');
            });

            it('url is http', function () {
                utils.urlFor('admin', true).should.equal('http://my-ghost-blog.com/ghost/');
            });

            it('custom admin url is set', function () {
                fakeConfig.adminUrl = 'https://admin.my-ghost-blog.com';

                utils.urlFor('admin', true).should.equal('https://admin.my-ghost-blog.com/ghost/');
            });

            it('blog is on subdir (absolute, no trailing slash)', function () {
                fakeConfig.url = 'http://my-ghost-blog.com/blog';

                utils.urlFor('admin', true).should.equal('http://my-ghost-blog.com/blog/ghost/');
            });

            it('blog is on subdir (absolute, trailing slash)', function () {
                fakeConfig.url = 'http://my-ghost-blog.com/blog/';

                utils.urlFor('admin', true).should.equal('http://my-ghost-blog.com/blog/ghost/');
            });

            it('blog is on subdir (relative, no trailing slash)', function () {
                fakeConfig.url = 'http://my-ghost-blog.com/blog';

                utils.urlFor('admin').should.equal('/blog/ghost/');
            });

            it('blog is on subdir (separate admin, absolute, no trailing slash)', function () {
                fakeConfig.url = 'http://my-ghost-blog.com/blog';
                fakeConfig.adminUrl = 'http://something.com';

                utils.urlFor('admin', true).should.equal('http://something.com/blog/ghost/');
            });

            it('blog is on subdir (separate admin with subdir, absolute, no trailing slash)', function () {
                fakeConfig.url = 'http://my-ghost-blog.com/blog';
                fakeConfig.adminUrl = 'http://something.com/blog';

                utils.urlFor('admin', true).should.equal('http://something.com/blog/ghost/');
            });

            it('blog is on subdir (separate admin with subdir, absolute, trailing slash)', function () {
                fakeConfig.url = 'http://my-ghost-blog.com/blog/';
                fakeConfig.adminUrl = 'http://something.com/blog/';

                utils.urlFor('admin', true).should.equal('http://something.com/blog/ghost/');
            });

            it('blog is on subdir (separate admin with subdir, absolute, no trailing admin slash)', function () {
                fakeConfig.url = 'http://my-ghost-blog.com/blog/';
                fakeConfig.adminUrl = 'http://something.com/blog';

                utils.urlFor('admin', true).should.equal('http://something.com/blog/ghost/');
            });
        });

        describe('api', function () {
            it('should return admin url when set', function () {
                fakeConfig.url = 'http://my-ghost-blog.com';
                fakeConfig.adminUrl = 'https://something.de';

                utils
                    .urlFor('api', {type: 'content'}, true)
                    .should.eql('https://something.de/ghost/api/content/');
            });

            it('url has subdir', function () {
                fakeConfig.url = 'http://my-ghost-blog.com/blog';

                utils
                    .urlFor('api', {type: 'content'}, true)
                    .should.eql('http://my-ghost-blog.com/blog/ghost/api/content/');
            });

            it('relative path is correct', function () {
                fakeConfig.url = 'http://my-ghost-blog.com';
                utils
                    .urlFor('api', {type: 'content'})
                    .should.eql('/ghost/api/content/');
            });

            it('relative path with subdir is correct', function () {
                fakeConfig.url = 'http://my-ghost-blog.com/blog';

                utils
                    .urlFor('api', {type: 'content'})
                    .should.eql('/blog/ghost/api/content/');
            });

            it('should return http if config.url is http', function () {
                fakeConfig.url = 'http://my-ghost-blog.com';
                utils
                    .urlFor('api', {type: 'content'}, true)
                    .should.eql('http://my-ghost-blog.com/ghost/api/content/');
            });

            it('should return https if config.url is https', function () {
                fakeConfig.url = 'https://my-ghost-blog.com';
                utils
                    .urlFor('api', {type: 'content'}, true)
                    .should.eql('https://my-ghost-blog.com/ghost/api/content/');
            });

            it('should return https if admin.url is https', function () {
                fakeConfig.url = 'https://my-ghost-blog.com';
                fakeConfig.adminUrl = 'https://admin.ghost.example';

                utils
                    .urlFor('api', {type: 'content'}, true)
                    .should.eql('https://admin.ghost.example/ghost/api/content/');
            });

            it('should return admin api path when requested', function () {
                fakeConfig.url = 'https://my-ghost-blog.com';
                utils
                    .urlFor('api', {type: 'admin'}, true)
                    .should.eql('https://my-ghost-blog.com/ghost/api/admin/');
            });

            it('returns default type if type is unknown', function () {
                fakeConfig.url = 'https://my-ghost-blog.com';
                utils
                    .urlFor('api', {type: 'fred'}, true)
                    .should.eql('https://my-ghost-blog.com/ghost/api/content/');
            });

            it('with just version and no version type returns correct api path', function () {
                fakeConfig.url = 'https://my-ghost-blog.com';
                utils
                    .urlFor('api', {}, true)
                    .should.eql('https://my-ghost-blog.com/ghost/api/content/');
            });
        });
    });

    describe('replacePermalink', function () {
        it('calls outs to utils/replace-permalink', function () {
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
            utils.isSSL('https://example.com').should.be.true;
            utils.isSSL('http://example.com').should.be.false;
        });
    });

    describe('redirects', function () {
        it('performs 301 redirect correctly', function (done) {
            var res = {};

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
            fakeConfig.adminUrl = 'https://admin.myblog.com/';

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
            const spy = sandbox.spy(utils._utils, 'htmlRelativeToAbsolute');

            utils.htmlRelativeToAbsolute('html', 'my-awesome-post', {secure: true});

            const {calledOnce, firstCall} = spy;
            calledOnce.should.be.true('called once');
            firstCall.args[0].should.eql('html');
            firstCall.args[1].should.eql('http://my-ghost-blog.com/');
            firstCall.args[2].should.eql('my-awesome-post');
            firstCall.args[3].should.deepEqual({
                assetsOnly: false,
                staticImageUrlPrefix: 'content/images',
                staticFilesUrlPrefix: 'content/files',
                staticMediaUrlPrefix: 'content/media',
                secure: true,
                imageBaseUrl: 'http://my-ghost-blog.com',
                filesBaseUrl: null,
                mediaBaseUrl: null
            });
        });

        it('correctly passes through options with no itemPath', function () {
            const spy = sandbox.spy(utils._utils, 'htmlRelativeToAbsolute');

            utils.htmlRelativeToAbsolute('html', {secure: true});

            const {calledOnce, firstCall} = spy;
            calledOnce.should.be.true('called once');
            firstCall.args[0].should.eql('html');
            firstCall.args[1].should.eql('http://my-ghost-blog.com/');
            should.not.exist(firstCall.args[2]);
            firstCall.args[3].should.deepEqual({
                assetsOnly: false,
                staticImageUrlPrefix: 'content/images',
                staticFilesUrlPrefix: 'content/files',
                staticMediaUrlPrefix: 'content/media',
                secure: true,
                imageBaseUrl: 'http://my-ghost-blog.com',
                filesBaseUrl: null,
                mediaBaseUrl: null
            });
        });
    });

    describe('htmlAbsoluteToRelative', function () {
        it('calls out to utils/html-absolute-to-relative', function () {
            const spy = sandbox.spy(utils._utils, 'htmlAbsoluteToRelative');

            utils.htmlAbsoluteToRelative('html');

            const {calledOnce, firstCall} = spy;
            calledOnce.should.be.true('called once');
            firstCall.args[0].should.eql('html');
            firstCall.args[1].should.eql('http://my-ghost-blog.com/');
            firstCall.args[2].should.deepEqual({
                assetsOnly: false,
                staticImageUrlPrefix: 'content/images',
                staticFilesUrlPrefix: 'content/files',
                staticMediaUrlPrefix: 'content/media',
                imageBaseUrl: 'http://my-ghost-blog.com',
                filesBaseUrl: null,
                mediaBaseUrl: null
            });
        });
    });

    describe('markdownRelativeToAbsolute', function () {
        it('calls out to utils/markdown-relative-to-absolute', function () {
            const spy = sandbox.spy(utils._utils, 'markdownRelativeToAbsolute');

            utils.markdownRelativeToAbsolute('markdown', 'my-awesome-post', {secure: true});

            const {calledOnce, firstCall} = spy;
            calledOnce.should.be.true('called once');
            firstCall.args[0].should.eql('markdown');
            firstCall.args[1].should.eql('http://my-ghost-blog.com/');
            firstCall.args[2].should.eql('my-awesome-post');
            firstCall.args[3].should.deepEqual({
                assetsOnly: false,
                staticImageUrlPrefix: 'content/images',
                staticFilesUrlPrefix: 'content/files',
                staticMediaUrlPrefix: 'content/media',
                secure: true,
                imageBaseUrl: 'http://my-ghost-blog.com',
                filesBaseUrl: null,
                mediaBaseUrl: null
            });
        });

        it('correctly passes through options with no itemPath', function () {
            const spy = sandbox.spy(utils._utils, 'markdownRelativeToAbsolute');

            utils.markdownRelativeToAbsolute('markdown', {secure: true});

            const {calledOnce, firstCall} = spy;
            calledOnce.should.be.true('called once');
            firstCall.args[0].should.eql('markdown');
            firstCall.args[1].should.eql('http://my-ghost-blog.com/');
            should.not.exist(firstCall.args[2]);
            firstCall.args[3].should.deepEqual({
                assetsOnly: false,
                staticImageUrlPrefix: 'content/images',
                staticFilesUrlPrefix: 'content/files',
                staticMediaUrlPrefix: 'content/media',
                secure: true,
                imageBaseUrl: 'http://my-ghost-blog.com',
                filesBaseUrl: null,
                mediaBaseUrl: null
            });
        });
    });

    describe('markdownAbsoluteToRelative', function () {
        it('calls out to utils/markdown-absolute-to-relative', function () {
            const spy = sandbox.spy(utils._utils, 'markdownAbsoluteToRelative');

            utils.markdownAbsoluteToRelative('markdown', {assetsOnly: true});

            const {calledOnce, firstCall} = spy;
            calledOnce.should.be.true('called once');
            firstCall.args[0].should.eql('markdown');
            firstCall.args[1].should.eql('http://my-ghost-blog.com/');
            firstCall.args[2].should.deepEqual({
                assetsOnly: true,
                staticImageUrlPrefix: 'content/images',
                staticFilesUrlPrefix: 'content/files',
                staticMediaUrlPrefix: 'content/media',
                imageBaseUrl: 'http://my-ghost-blog.com',
                filesBaseUrl: null,
                mediaBaseUrl: null
            });
        });
    });

    describe('mobiledocRelativeToAbsolute', function () {
        it('calls out to utils/mobiledoc-relative-to-absolute', function () {
            const stub = sandbox.stub(utils._utils, 'mobiledocRelativeToAbsolute');

            const cards = [{name: 'test'}];
            utils.mobiledocRelativeToAbsolute('serializedMobiledoc', 'my-awesome-post', {assetsOnly: true, cards});

            const {calledOnce, firstCall} = stub;
            calledOnce.should.be.true('called once');
            firstCall.args[0].should.eql('serializedMobiledoc');
            firstCall.args[1].should.eql('http://my-ghost-blog.com/');
            firstCall.args[2].should.eql('my-awesome-post');
            firstCall.args[3].should.deepEqual({
                assetsOnly: true,
                staticImageUrlPrefix: 'content/images',
                staticFilesUrlPrefix: 'content/files',
                staticMediaUrlPrefix: 'content/media',
                cards,
                imageBaseUrl: 'http://my-ghost-blog.com',
                filesBaseUrl: null,
                mediaBaseUrl: null
            });
        });

        it('correctly passes through options with no itemPath', function () {
            const stub = sandbox.stub(utils._utils, 'mobiledocRelativeToAbsolute');

            const cards = [{name: 'test'}];
            utils.mobiledocRelativeToAbsolute('serializedMobiledoc', {cards, secure: true});

            const {calledOnce, firstCall} = stub;
            calledOnce.should.be.true('called once');
            firstCall.args[0].should.eql('serializedMobiledoc');
            firstCall.args[1].should.eql('http://my-ghost-blog.com/');
            should.not.exist(firstCall.args[2]);
            firstCall.args[3].should.deepEqual({
                assetsOnly: false,
                staticImageUrlPrefix: 'content/images',
                staticFilesUrlPrefix: 'content/files',
                staticMediaUrlPrefix: 'content/media',
                secure: true,
                cards,
                imageBaseUrl: 'http://my-ghost-blog.com',
                filesBaseUrl: null,
                mediaBaseUrl: null
            });
        });
    });

    describe('mobiledocAbsoluteToRelative', function () {
        it('calls out to utils/mobiledoc-absolute-to-relative', function () {
            const stub = sandbox.stub(utils._utils, 'mobiledocAbsoluteToRelative');

            const cards = [{name: 'test'}];
            utils.mobiledocAbsoluteToRelative('serializedMobiledoc', {assetsOnly: true, cards});

            const {calledOnce, firstCall} = stub;
            calledOnce.should.be.true('called once');
            firstCall.args[0].should.eql('serializedMobiledoc');
            firstCall.args[1].should.eql('http://my-ghost-blog.com/');
            firstCall.args[2].should.deepEqual({
                assetsOnly: true,
                staticImageUrlPrefix: 'content/images',
                staticFilesUrlPrefix: 'content/files',
                staticMediaUrlPrefix: 'content/media',
                cards,
                imageBaseUrl: 'http://my-ghost-blog.com',
                filesBaseUrl: null,
                mediaBaseUrl: null
            });
        });
    });

    describe('lexicalRelativeToAbsolute', function () {
        it('calls out to utils/lexical-relative-to-absolute', function () {
            const stub = sandbox.stub(utils._utils, 'lexicalRelativeToAbsolute');

            utils.lexicalRelativeToAbsolute('serializedLexical', 'my-awesome-post', {assetsOnly: true});

            const {calledOnce, firstCall} = stub;
            calledOnce.should.be.true('called once');
            firstCall.args[0].should.eql('serializedLexical');
            firstCall.args[1].should.eql('http://my-ghost-blog.com/');
            firstCall.args[2].should.eql('my-awesome-post');
            firstCall.args[3].should.deepEqual({
                assetsOnly: true,
                staticImageUrlPrefix: 'content/images',
                staticFilesUrlPrefix: 'content/files',
                staticMediaUrlPrefix: 'content/media',
                imageBaseUrl: 'http://my-ghost-blog.com',
                filesBaseUrl: null,
                mediaBaseUrl: null
            });
        });

        it('correctly passes through options with no itemPath', function () {
            const stub = sandbox.stub(utils._utils, 'lexicalRelativeToAbsolute');

            utils.lexicalRelativeToAbsolute('serializedLexical', {secure: true});

            const {calledOnce, firstCall} = stub;
            calledOnce.should.be.true('called once');
            firstCall.args[0].should.eql('serializedLexical');
            firstCall.args[1].should.eql('http://my-ghost-blog.com/');
            should.not.exist(firstCall.args[2]);
            firstCall.args[3].should.deepEqual({
                assetsOnly: false,
                staticImageUrlPrefix: 'content/images',
                staticFilesUrlPrefix: 'content/files',
                staticMediaUrlPrefix: 'content/media',
                secure: true,
                imageBaseUrl: 'http://my-ghost-blog.com',
                filesBaseUrl: null,
                mediaBaseUrl: null
            });
        });
    });

    describe('lexicalAbsoluteToRelative', function () {
        it('calls out to utils/lexical-absolute-to-relative', function () {
            const stub = sandbox.stub(utils._utils, 'lexicalAbsoluteToRelative');

            utils.lexicalAbsoluteToRelative('serializedLexical', {assetsOnly: true});

            const {calledOnce, firstCall} = stub;
            calledOnce.should.be.true('called once');
            firstCall.args[0].should.eql('serializedLexical');
            firstCall.args[1].should.eql('http://my-ghost-blog.com/');
            firstCall.args[2].should.deepEqual({
                assetsOnly: true,
                staticImageUrlPrefix: 'content/images',
                staticFilesUrlPrefix: 'content/files',
                staticMediaUrlPrefix: 'content/media',
                imageBaseUrl: 'http://my-ghost-blog.com',
                filesBaseUrl: null,
                mediaBaseUrl: null
            });
        });
    });

    describe('isSiteUrl', function () {
        describe('Without subdomain', function () {
            beforeEach(function () {
                fakeConfig.url = 'http://localhost:2368';
            });

            it('returns true for the root domain', function () {
                assert(utils.isSiteUrl(new URL('http://localhost:2368')));
            });

            it('returns true for a path along the root domain', function () {
                assert(utils.isSiteUrl(new URL('http://localhost:2368/path')));
            });

            it('returns false for a different domain', function () {
                assert(!utils.isSiteUrl(new URL('https://google.com/path')));
            });
        });

        describe('With subdomain', function () {
            beforeEach(function () {
                fakeConfig.url = 'http://localhost:2368/dir';
            });

            afterEach(function () {
                sinon.restore();
            });

            it('returns false for the root domain', function () {
                assert(!utils.isSiteUrl(new URL('http://localhost:2368')));
            });

            it('returns false for the root domain with directory without trailing slash', function () {
                assert(!utils.isSiteUrl(new URL('http://localhost:2368/dir')));
            });

            it('returns true for the root domain with directory', function () {
                assert(utils.isSiteUrl(new URL('http://localhost:2368/dir/')));
            });

            it('returns true for a path along the root domain', function () {
                assert(utils.isSiteUrl(new URL('http://localhost:2368/dir/path')));
            });

            it('returns false for a different domain', function () {
                assert(!utils.isSiteUrl(new URL('https://google.com/dir/path')));
            });

            it('returns false if not on same subdirectory', function () {
                assert(!utils.isSiteUrl(new URL('http://localhost:2368/different-dir')));
                // Check if the matching is not dumb and only matches at the start
                assert(!utils.isSiteUrl(new URL('http://localhost:2368/different/dir')));
            });
        });

        describe('Admin context', function () {
            beforeEach(function () {
                fakeConfig.adminUrl = 'http://admin.site';
                fakeConfig.url = 'http://site.site';
            });

            it('returns false without ghost subdirectory', function () {
                assert(!utils.isSiteUrl(new URL('http://admin.site/'), 'admin'));
            });

            it('returns true for the admin domain', function () {
                assert(utils.isSiteUrl(new URL('http://admin.site/ghost/'), 'admin'));
            });

            it('returns false for the site domain', function () {
                assert(!utils.isSiteUrl(new URL('http://site.site/ghost/'), 'admin'));
            });
        });
    });
});

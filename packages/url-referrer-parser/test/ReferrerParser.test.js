const should = require('should');
const sinon = require('sinon');
const ReferrerParser = require('../lib/ReferrerParser');

describe('ReferrerParser', function () {
    describe('Constructor', function () {
        it('initializes with empty options', function () {
            const parser = new ReferrerParser();
            should.exist(parser);
            should.not.exist(parser.siteUrl);
            should.not.exist(parser.adminUrl);
        });

        it('initializes with provided options', function () {
            const parser = new ReferrerParser({
                siteUrl: 'https://example.com',
                adminUrl: 'https://admin.example.com'
            });
            should.exist(parser);
            should.exist(parser.siteUrl);
            should.exist(parser.adminUrl);
            parser.siteUrl.href.should.equal('https://example.com/');
            parser.adminUrl.href.should.equal('https://admin.example.com/');
        });

        it('handles invalid URLs', function () {
            const parser = new ReferrerParser({
                siteUrl: 'not-a-url',
                adminUrl: 'also-not-a-url'
            });
            should.exist(parser);
            should.not.exist(parser.siteUrl);
            should.not.exist(parser.adminUrl);
        });
    });

    describe('parse', function () {
        let parser;
        let sandbox;

        beforeEach(function () {
            sandbox = sinon.createSandbox();
            parser = new ReferrerParser({
                siteUrl: 'https://example.com',
                adminUrl: 'https://admin.example.com/ghost'
            });
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('returns direct for null URL', function () {
            const result = parser.parse(null);
            should.exist(result);
            result.referrerSource.should.equal('Direct');
            should.equal(result.referrerMedium, null);
            should.equal(result.referrerUrl, null);
        });

        it('returns direct for empty URL', function () {
            const result = parser.parse('');
            should.exist(result);
            result.referrerSource.should.equal('Direct');
            should.equal(result.referrerMedium, null);
            should.equal(result.referrerUrl, null);
        });

        it('returns direct for invalid URL', function () {
            const result = parser.parse('not-a-url');
            should.exist(result);
            result.referrerSource.should.equal('Direct');
            should.equal(result.referrerMedium, null);
            should.equal(result.referrerUrl, null);
        });

        it('skips Stripe checkout URLs', function () {
            // Don't use a real URL to avoid network requests
            sandbox.stub(parser, 'getUrlFromStr').returns({
                hostname: 'checkout.stripe.com',
                pathname: '/pay'
            });
            
            const result = parser.parse('https://checkout.stripe.com/pay/xyz');
            should.exist(result);
            result.referrerSource.should.equal('Direct');
            should.equal(result.referrerMedium, null);
            should.equal(result.referrerUrl, null);
        });

        it('detects Ghost Explore from source param', function () {
            // Don't use a real URL to avoid network requests
            sandbox.stub(parser, 'getUrlFromStr').returns({
                hostname: 'test.com',
                pathname: '/test',
                search: '?utm_source=ghost-explore'
            });
            
            // Stub isGhostExploreRef to return true
            sandbox.stub(parser, 'isGhostExploreRef').returns(true);

            const result = parser.parse('https://test.com/test?utm_source=ghost-explore');
            should.exist(result);
            result.referrerSource.should.equal('Ghost Explore');
            result.referrerMedium.should.equal('Ghost Network');
            result.referrerUrl.should.equal('test.com');
        });

        it('detects Ghost Explore from admin URL', function () {
            // Create a controlled test environment
            sandbox.stub(parser, 'isGhostExploreRef').returns(true);
            
            const result = parser.parse('https://admin.example.com/ghost/#/dashboard');
            should.exist(result);
            result.referrerSource.should.equal('Ghost Explore');
            result.referrerMedium.should.equal('Ghost Network');
            result.referrerUrl.should.equal('admin.example.com');
        });

        it('detects Ghost Explore from ghost.org/explore', function () {
            // Create a controlled test environment
            sandbox.stub(parser, 'isGhostExploreRef').returns(true);
            
            const result = parser.parse('https://ghost.org/explore/test');
            should.exist(result);
            result.referrerSource.should.equal('Ghost Explore');
            result.referrerMedium.should.equal('Ghost Network');
            result.referrerUrl.should.equal('ghost.org');
        });

        it('detects Ghost.org', function () {
            // Create a controlled test environment
            sandbox.stub(parser, 'isGhostOrgUrl').returns(true);
            sandbox.stub(parser, 'isGhostExploreRef').returns(false);
            
            const result = parser.parse('https://ghost.org/pricing/');
            should.exist(result);
            result.referrerSource.should.equal('Ghost.org');
            result.referrerMedium.should.equal('Ghost Network');
            result.referrerUrl.should.equal('ghost.org');
        });

        it('detects Ghost Newsletter from UTM source', function () {
            // Create a controlled test environment
            const url = new URL('https://test.com/test?utm_source=test-newsletter');
            sandbox.stub(parser, 'getUrlFromStr').returns(url);
            sandbox.stub(parser, 'isGhostOrgUrl').returns(false);
            sandbox.stub(parser, 'isGhostExploreRef').returns(false);
            sandbox.stub(parser, 'isGhostNewsletter').returns(true);
            
            const result = parser.parse('https://test.com/test?utm_source=test-newsletter');
            should.exist(result);
            result.referrerSource.should.equal('test newsletter');
            result.referrerMedium.should.equal('Email');
            result.referrerUrl.should.equal('test.com');
        });

        it('processes UTM parameters', function () {
            // Create a controlled test environment
            sandbox.stub(parser, 'isGhostOrgUrl').returns(false);
            sandbox.stub(parser, 'isGhostExploreRef').returns(false);
            sandbox.stub(parser, 'isGhostNewsletter').returns(false);
            
            // Mock the URL and URLSearchParams
            const url = new URL('https://test.com/test?utm_source=twitter&utm_medium=social');
            sandbox.stub(parser, 'getUrlFromStr').returns(url);
            
            const result = parser.parse('https://test.com/test?utm_source=twitter&utm_medium=social');
            should.exist(result);
            result.referrerSource.should.equal('Twitter');
            result.referrerMedium.should.equal('social');
            result.referrerUrl.should.equal('test.com');
        });

        it('identifies known referrers', function () {
            // Create a controlled test environment
            sandbox.stub(parser, 'isGhostOrgUrl').returns(false);
            sandbox.stub(parser, 'isGhostExploreRef').returns(false);
            sandbox.stub(parser, 'isGhostNewsletter').returns(false);
            sandbox.stub(parser, 'isSiteDomain').returns(false);
            
            // Mock the getDataFromUrl to return known referrer data
            sandbox.stub(parser, 'getDataFromUrl').returns({
                source: 'Google',
                medium: 'search'
            });
            
            const result = parser.parse('https://www.google.com/search?q=ghost+cms');
            should.exist(result);
            result.referrerSource.should.equal('Google');
            result.referrerMedium.should.equal('search');
            result.referrerUrl.should.equal('www.google.com');
        });

        it('uses hostname as fallback for unknown referrers', function () {
            // Create a controlled test environment
            sandbox.stub(parser, 'isGhostOrgUrl').returns(false);
            sandbox.stub(parser, 'isGhostExploreRef').returns(false);
            sandbox.stub(parser, 'isGhostNewsletter').returns(false);
            sandbox.stub(parser, 'isSiteDomain').returns(false);
            sandbox.stub(parser, 'getDataFromUrl').returns(null);
            
            const url = new URL('https://unknown-site.com/page');
            sandbox.stub(parser, 'getUrlFromStr').returns(url);
            
            const result = parser.parse('https://unknown-site.com/page');
            should.exist(result);
            result.referrerSource.should.equal('unknown-site.com');
            should.equal(result.referrerMedium, null);
            result.referrerUrl.should.equal('unknown-site.com');
        });

        it('handles internal traffic', function () {
            // Create a controlled test environment
            sandbox.stub(parser, 'isGhostOrgUrl').returns(false);
            sandbox.stub(parser, 'isGhostExploreRef').returns(false);
            sandbox.stub(parser, 'isSiteDomain').returns(true);
            
            const result = parser.parse('https://example.com/blog');
            should.exist(result);
            result.referrerSource.should.equal('Direct');
            should.equal(result.referrerMedium, null);
            should.equal(result.referrerUrl, null);
        });
    });

    describe('isSiteDomain', function () {
        it('returns false when siteUrl is not configured', function () {
            const parser = new ReferrerParser();
            const result = parser.isSiteDomain(new URL('https://example.com'));
            result.should.be.false();
        });

        it('returns true for matching domain and path', function () {
            const parser = new ReferrerParser({
                siteUrl: 'https://example.com/blog'
            });
            const result = parser.isSiteDomain(new URL('https://example.com/blog/post'));
            result.should.be.true();
        });

        it('returns false for matching domain but non-matching path', function () {
            const parser = new ReferrerParser({
                siteUrl: 'https://example.com/blog'
            });
            const result = parser.isSiteDomain(new URL('https://example.com/news'));
            result.should.be.false();
        });

        it('returns false for non-matching domain', function () {
            const parser = new ReferrerParser({
                siteUrl: 'https://example.com'
            });
            const result = parser.isSiteDomain(new URL('https://different.com'));
            result.should.be.false();
        });

        it('handles exceptions gracefully', function () {
            const parser = new ReferrerParser({
                siteUrl: 'https://example.com'
            });
            const result = parser.isSiteDomain(null);
            result.should.be.false();
        });
    });

    describe('utility methods', function () {
        let parser;

        beforeEach(function () {
            parser = new ReferrerParser();
        });

        describe('getUrlFromStr', function () {
            it('returns URL object for valid URL', function () {
                const result = parser.getUrlFromStr('https://example.com');
                should.exist(result);
                result.should.be.an.instanceOf(URL);
                result.href.should.equal('https://example.com/');
            });

            it('returns null for invalid URL', function () {
                const result = parser.getUrlFromStr('not-a-url');
                should.not.exist(result);
            });

            it('returns null for null input', function () {
                const result = parser.getUrlFromStr(null);
                should.not.exist(result);
            });
        });

        describe('isGhostNewsletter', function () {
            it('returns true for sources ending with -newsletter', function () {
                const result = parser.isGhostNewsletter({
                    referrerSource: 'test-newsletter'
                });
                result.should.be.true();
            });

            it('returns false for other sources', function () {
                const result = parser.isGhostNewsletter({
                    referrerSource: 'test'
                });
                result.should.be.false();
            });

            it('handles null gracefully', function () {
                const result = parser.isGhostNewsletter({
                    referrerSource: null
                });
                should(result).be.false();
            });
        });

        describe('isGhostOrgUrl', function () {
            it('returns true for ghost.org', function () {
                const result = parser.isGhostOrgUrl(new URL('https://ghost.org'));
                result.should.be.true();
            });

            it('returns true for ghost.org subpaths', function () {
                const result = parser.isGhostOrgUrl(new URL('https://ghost.org/pricing'));
                result.should.be.true();
            });

            it('returns false for other domains', function () {
                const result = parser.isGhostOrgUrl(new URL('https://example.com'));
                result.should.be.false();
            });

            it('handles null gracefully', function () {
                const result = parser.isGhostOrgUrl(null);
                should(result).be.false();
            });
        });

        describe('isGhostExploreRef', function () {
            it('returns true for ghost-explore source', function () {
                const result = parser.isGhostExploreRef({
                    referrerSource: 'ghost-explore'
                });
                result.should.be.true();
            });

            it('returns true for ghost.org/explore path', function () {
                const result = parser.isGhostExploreRef({
                    referrerUrl: new URL('https://ghost.org/explore')
                });
                result.should.be.true();
            });

            it('returns true for admin URL match when configured', function () {
                const adminParser = new ReferrerParser({
                    adminUrl: 'https://admin.example.com/ghost'
                });
                const result = adminParser.isGhostExploreRef({
                    referrerUrl: new URL('https://admin.example.com/ghost/dashboard')
                });
                result.should.be.true();
            });

            it('returns false for non-matching cases', function () {
                const result = parser.isGhostExploreRef({
                    referrerUrl: new URL('https://example.com'),
                    referrerSource: 'other'
                });
                result.should.be.false();
            });

            it('handles null gracefully', function () {
                const result = parser.isGhostExploreRef({});
                should(result).be.false();
            });
        });

        describe('getDataFromUrl', function () {
            it('returns data for known referrers', function () {
                const result = parser.getDataFromUrl(new URL('https://www.google.com/search'));
                should.exist(result);
                result.source.should.equal('Google');
                result.medium.should.equal('search');
            });

            it('prioritizes longer matches', function () {
                const result = parser.getDataFromUrl(new URL('https://google.ac/products'));
                should.exist(result);
                result.source.should.equal('Google Product Search');
                result.medium.should.equal('search');
            });

            it('returns null for unknown referrers', function () {
                const result = parser.getDataFromUrl(new URL('https://unknown-site.com'));
                should.not.exist(result);
            });

            it('handles null gracefully', function () {
                const result = parser.getDataFromUrl(null);
                should.not.exist(result);
            });
        });
    });
}); 
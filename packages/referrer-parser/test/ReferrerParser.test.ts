import should from 'should';
import sinon from 'sinon';
import { describe, it, beforeEach, afterEach } from 'vitest';
import { ReferrerParser, ReferrerData, ParserOptions } from '../lib/ReferrerParser';

// Helper function to safely assert on properties that might be null
function assertPropertyEquals(obj: any, property: string, expectedValue: any) {
    should.exist(obj);
    
    if (expectedValue === null) {
        should.equal(obj[property], null);
    } else {
        should.exist(obj[property]);
        obj[property].should.equal(expectedValue);
    }
}

describe('ReferrerParser', () => {
    describe('Constructor', () => {
        it('initializes with empty options', () => {
            const parser = new ReferrerParser();
            should.exist(parser);
            should.not.exist((parser as any).siteUrl);
            should.not.exist((parser as any).adminUrl);
        });

        it('initializes with provided options', () => {
            const parser = new ReferrerParser({
                siteUrl: 'https://example.com',
                adminUrl: 'https://admin.example.com'
            });
            should.exist(parser);
            should.exist((parser as any).siteUrl);
            should.exist((parser as any).adminUrl);
            (parser as any).siteUrl.href.should.equal('https://example.com/');
            (parser as any).adminUrl.href.should.equal('https://admin.example.com/');
        });

        it('handles invalid URLs', () => {
            const parser = new ReferrerParser({
                siteUrl: 'not-a-url',
                adminUrl: 'also-not-a-url'
            });
            should.exist(parser);
            should.not.exist((parser as any).siteUrl);
            should.not.exist((parser as any).adminUrl);
        });
    });

    describe('parse', () => {
        let parser: ReferrerParser;
        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
            parser = new ReferrerParser({
                siteUrl: 'https://example.com',
                adminUrl: 'https://admin.example.com/ghost'
            });
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('returns null values for null URL', () => {
            const result = parser.parse(null as unknown as string);
            should.exist(result);
            assertPropertyEquals(result, 'referrerSource', null);
            assertPropertyEquals(result, 'referrerMedium', null);
            assertPropertyEquals(result, 'referrerUrl', null);
        });

        it('returns null values for empty URL', () => {
            const result = parser.parse('');
            should.exist(result);
            assertPropertyEquals(result, 'referrerSource', null);
            assertPropertyEquals(result, 'referrerMedium', null);
            assertPropertyEquals(result, 'referrerUrl', null);
        });

        it('returns null values for invalid URL', () => {
            const result = parser.parse('not-a-url');
            should.exist(result);
            assertPropertyEquals(result, 'referrerSource', null);
            assertPropertyEquals(result, 'referrerMedium', null);
            assertPropertyEquals(result, 'referrerUrl', null);
        });

        it('detects Ghost Explore from source param', () => {
            // Don't use a real URL to avoid network requests
            sandbox.stub(parser, 'getUrlFromStr').returns({
                hostname: 'test.com',
                pathname: '/test',
                search: '?utm_source=ghost-explore'
            } as URL);
            
            // Stub isGhostExploreRef to return true
            sandbox.stub(parser, 'isGhostExploreRef').returns(true);

            const result = parser.parse('https://test.com/test?utm_source=ghost-explore');
            should.exist(result);
            assertPropertyEquals(result, 'referrerSource', 'Ghost Explore');
            assertPropertyEquals(result, 'referrerMedium', 'Ghost Network');
            assertPropertyEquals(result, 'referrerUrl', 'test.com');
        });

        it('detects Ghost Explore from admin URL', () => {
            // Create a controlled test environment
            sandbox.stub(parser, 'isGhostExploreRef').returns(true);
            
            const result = parser.parse('https://admin.example.com/ghost/#/dashboard');
            should.exist(result);
            assertPropertyEquals(result, 'referrerSource', 'Ghost Explore');
            assertPropertyEquals(result, 'referrerMedium', 'Ghost Network');
            assertPropertyEquals(result, 'referrerUrl', 'admin.example.com');
        });

        it('detects Ghost Explore from ghost.org/explore', () => {
            // Create a controlled test environment
            sandbox.stub(parser, 'isGhostExploreRef').returns(true);
            
            const result = parser.parse('https://ghost.org/explore/test');
            should.exist(result);
            assertPropertyEquals(result, 'referrerSource', 'Ghost Explore');
            assertPropertyEquals(result, 'referrerMedium', 'Ghost Network');
            assertPropertyEquals(result, 'referrerUrl', 'ghost.org');
        });

        it('detects Ghost.org', () => {
            // Create a controlled test environment
            sandbox.stub(parser, 'isGhostOrgUrl').returns(true);
            sandbox.stub(parser, 'isGhostExploreRef').returns(false);
            
            const result = parser.parse('https://ghost.org/pricing/');
            should.exist(result);
            assertPropertyEquals(result, 'referrerSource', 'Ghost.org');
            assertPropertyEquals(result, 'referrerMedium', 'Ghost Network');
            assertPropertyEquals(result, 'referrerUrl', 'ghost.org');
        });

        // TODO: Not entirely sure this should pass or fail. Leave it for the moment.
        it.skip('detects Ghost Newsletter from UTM source', () => {
            // Create a controlled test environment
            const url = new URL('https://test.com/test?utm_source=test-newsletter');
            sandbox.stub(parser, 'getUrlFromStr').returns(url);
            sandbox.stub(parser, 'isGhostOrgUrl').returns(false);
            sandbox.stub(parser, 'isGhostExploreRef').returns(false);
            sandbox.stub(parser, 'isGhostNewsletter').returns(true);
            
            const result = parser.parse('https://test.com/test?utm_source=test-newsletter');
            should.exist(result);
            // Now only the -newsletter suffix is replaced with a space
            assertPropertyEquals(result, 'referrerSource', 'test newsletter');
            assertPropertyEquals(result, 'referrerMedium', 'Email');
            assertPropertyEquals(result, 'referrerUrl', 'test.com');
        });

        it('processes UTM parameters', () => {
            // Create a controlled test environment
            sandbox.stub(parser, 'isGhostOrgUrl').returns(false);
            sandbox.stub(parser, 'isGhostExploreRef').returns(false);
            sandbox.stub(parser, 'isGhostNewsletter').returns(false);
            
            // Mock the URL and URLSearchParams
            const url = new URL('https://test.com/test?utm_source=twitter&utm_medium=social');
            sandbox.stub(parser, 'getUrlFromStr').returns(url);
            
            const result = parser.parse('https://test.com/test?utm_source=twitter&utm_medium=social', 'twitter');
            should.exist(result);
            assertPropertyEquals(result, 'referrerSource', 'Twitter');
            assertPropertyEquals(result, 'referrerMedium', 'social');
            assertPropertyEquals(result, 'referrerUrl', 'test.com');
        });

        it('identifies known referrers', () => {
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
            assertPropertyEquals(result, 'referrerSource', 'Google');
            assertPropertyEquals(result, 'referrerMedium', 'search');
            assertPropertyEquals(result, 'referrerUrl', 'www.google.com');
        });

        it('uses hostname as fallback for unknown referrers', () => {
            // Create a controlled test environment
            sandbox.stub(parser, 'isGhostOrgUrl').returns(false);
            sandbox.stub(parser, 'isGhostExploreRef').returns(false);
            sandbox.stub(parser, 'isGhostNewsletter').returns(false);
            sandbox.stub(parser, 'isSiteDomain').returns(false);
            
            // Mock the getDataFromUrl to return null for unknown referrer
            sandbox.stub(parser, 'getDataFromUrl').returns(null);
            
            // Mock URL object
            const url = new URL('https://unknown-referrer.com/path');
            sandbox.stub(parser, 'getUrlFromStr').returns(url);
            
            const result = parser.parse('https://unknown-referrer.com/path');
            should.exist(result);
            assertPropertyEquals(result, 'referrerSource', 'unknown-referrer.com');
            assertPropertyEquals(result, 'referrerMedium', null);
            assertPropertyEquals(result, 'referrerUrl', 'unknown-referrer.com');
        });

        it('returns null values for internal traffic', () => {
            // Create a controlled test environment
            sandbox.stub(parser, 'isGhostOrgUrl').returns(false);
            sandbox.stub(parser, 'isGhostExploreRef').returns(false);
            sandbox.stub(parser, 'isGhostNewsletter').returns(false);
            sandbox.stub(parser, 'isSiteDomain').returns(true);
            
            const result = parser.parse('https://example.com/blog');
            should.exist(result);
            assertPropertyEquals(result, 'referrerSource', null);
            assertPropertyEquals(result, 'referrerMedium', null);
            assertPropertyEquals(result, 'referrerUrl', null);
        });
    });

    describe('getDataFromUrl', () => {
        it('returns null for null URL', () => {
            const parser = new ReferrerParser();
            const result = parser.getDataFromUrl(null);
            should.equal(result, null);
        });

        it('matches known referrers', () => {
            const parser = new ReferrerParser();
            const url = new URL('https://www.google.com/search?q=ghost+cms');
            const result = parser.getDataFromUrl(url);
            should.exist(result);
            result!.source.should.equal('Google');
            result!.medium.should.equal('search');
        });

        it('matches referrers with complex paths', () => {
            const parser = new ReferrerParser();
            const url = new URL('https://plus.google.com/communities/123456789');
            const result = parser.getDataFromUrl(url);
            should.exist(result);
            result!.source.should.equal('Google+');
        });

        it('prioritizes longer matches over shorter ones', () => {
            const parser = new ReferrerParser();
            const url = new URL('https://mail.google.com/mail/u/0/#inbox');
            const result = parser.getDataFromUrl(url);
            should.exist(result);
            result!.source.should.equal('Gmail');
            result!.medium.should.equal('email');
        });

        it('returns null for unknown referrers', () => {
            const parser = new ReferrerParser();
            const url = new URL('https://unknown-site.com/path');
            const result = parser.getDataFromUrl(url);
            should.equal(result, null);
        });
    });

    describe('getUrlFromStr', () => {
        it('returns null for null or empty URL', () => {
            const parser = new ReferrerParser();
            should.equal(parser.getUrlFromStr(null as unknown as string), null);
            should.equal(parser.getUrlFromStr(''), null);
        });

        it('returns URL object for valid URL', () => {
            const parser = new ReferrerParser();
            const url = parser.getUrlFromStr('https://example.com/path?query=test');
            should.exist(url);
            url!.href.should.equal('https://example.com/path?query=test');
            url!.hostname.should.equal('example.com');
            url!.pathname.should.equal('/path');
            url!.search.should.equal('?query=test');
        });

        it('returns null for invalid URL', () => {
            const parser = new ReferrerParser();
            should.equal(parser.getUrlFromStr('not-a-url'), null);
        });
    });

    describe('isSiteDomain', () => {
        it('returns false if no siteUrl configured', () => {
            const parser = new ReferrerParser();
            const url = new URL('https://example.com');
            const result = parser.isSiteDomain(url);
            should.equal(result, false);
        });

        it('returns false for null URL', () => {
            const parser = new ReferrerParser({
                siteUrl: 'https://example.com'
            });
            const result = parser.isSiteDomain(null);
            should.equal(result, false);
        });

        it('returns true for matching hostname and path', () => {
            const parser = new ReferrerParser({
                siteUrl: 'https://example.com/blog'
            });
            const url = new URL('https://example.com/blog/post');
            const result = parser.isSiteDomain(url);
            should.equal(result, true);
        });

        it('returns false for different hostname', () => {
            const parser = new ReferrerParser({
                siteUrl: 'https://example.com'
            });
            const url = new URL('https://other-site.com');
            const result = parser.isSiteDomain(url);
            should.equal(result, false);
        });

        it('returns false for same hostname but different base path', () => {
            const parser = new ReferrerParser({
                siteUrl: 'https://example.com/blog'
            });
            const url = new URL('https://example.com/shop');
            const result = parser.isSiteDomain(url);
            should.equal(result, false);
        });

        it('handles errors gracefully', () => {
            const parser = new ReferrerParser({
                siteUrl: 'https://example.com'
            });
            // Force an error by passing an invalid URL object
            const result = parser.isSiteDomain({} as URL);
            should.equal(result, false);
        });
    });

    describe('isGhostNewsletter', () => {
        it('returns false for null source', () => {
            const parser = new ReferrerParser();
            const result = parser.isGhostNewsletter({ referrerSource: null });
            should.equal(result, false);
        });

        it('returns true for sources ending with -newsletter', () => {
            const parser = new ReferrerParser();
            const result = parser.isGhostNewsletter({ referrerSource: 'test-newsletter' });
            should.equal(result, true);
        });

        it('returns false for other sources', () => {
            const parser = new ReferrerParser();
            const result = parser.isGhostNewsletter({ referrerSource: 'test' });
            should.equal(result, false);
        });
    });

    describe('isGhostOrgUrl', () => {
        it('returns false for null URL', () => {
            const parser = new ReferrerParser();
            const result = parser.isGhostOrgUrl(null);
            should.equal(result, false);
        });

        it('returns true for ghost.org hostname', () => {
            const parser = new ReferrerParser();
            const url = new URL('https://ghost.org/pricing');
            const result = parser.isGhostOrgUrl(url);
            should.equal(result, true);
        });

        it('returns false for other hostnames', () => {
            const parser = new ReferrerParser();
            const url = new URL('https://example.com');
            const result = parser.isGhostOrgUrl(url);
            should.equal(result, false);
        });
    });

    describe('isGhostExploreRef', () => {
        it('returns true for ghost-explore source param', () => {
            const parser = new ReferrerParser();
            const result = parser.isGhostExploreRef({
                referrerUrl: null,
                referrerSource: 'ghost-explore'
            });
            should.equal(result, true);
        });

        it('returns false for null URL and no source', () => {
            const parser = new ReferrerParser();
            const result = parser.isGhostExploreRef({
                referrerUrl: null
            });
            should.equal(result, false);
        });

        it('returns false for other URLs', () => {
            const parser = new ReferrerParser();
            const url = new URL('https://example.com');
            const result = parser.isGhostExploreRef({
                referrerUrl: url
            });
            should.equal(result, false);
        });
    });
}); 
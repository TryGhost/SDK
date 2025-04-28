import should from 'should';
import { expect, describe, it } from 'vitest';
import { parse, ReferrerParser, ReferrerData } from '../index';

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

describe('referrer-parser', () => {
    describe('exports', () => {
        it('exports parse function', () => {
            should.exist(parse);
            (parse as any).should.be.a.Function();
        });

        it('exports ReferrerParser class', () => {
            should.exist(ReferrerParser);
            (ReferrerParser as any).should.be.a.Function();
            new ReferrerParser().should.be.an.instanceOf(ReferrerParser);
        });
    });

    describe('parse function', () => {
        it('parses referrer URLs', () => {
            const result: ReferrerData = parse('https://www.google.com/search?q=ghost+cms');
            should.exist(result);
            result.should.have.properties(['referrerSource', 'referrerMedium', 'referrerUrl']);
            assertPropertyEquals(result, 'referrerSource', 'Google');
            assertPropertyEquals(result, 'referrerMedium', 'search');
            assertPropertyEquals(result, 'referrerUrl', 'www.google.com');
        });

        it('accepts configuration options', () => {
            const result: ReferrerData = parse('https://example.com/blog', {
                siteUrl: 'https://example.com'
            });
            should.exist(result);
            result.should.have.properties(['referrerSource', 'referrerMedium', 'referrerUrl']);
            assertPropertyEquals(result, 'referrerSource', null);
            assertPropertyEquals(result, 'referrerMedium', null);
            assertPropertyEquals(result, 'referrerUrl', null);
        });

        it('handles null and invalid URLs', () => {
            const result: ReferrerData = parse(null as unknown as string);
            should.exist(result);
            assertPropertyEquals(result, 'referrerSource', null);
            assertPropertyEquals(result, 'referrerMedium', null);
            assertPropertyEquals(result, 'referrerUrl', null);

            const invalidResult: ReferrerData = parse('not-a-url');
            should.exist(invalidResult);
            assertPropertyEquals(invalidResult, 'referrerSource', null);
            assertPropertyEquals(invalidResult, 'referrerMedium', null);
            assertPropertyEquals(invalidResult, 'referrerUrl', null);
        });

        it('uses provided source and medium parameters', () => {
            const result: ReferrerData = parse('https://example.com', {}, 'newsletter', 'email');
            should.exist(result);
            assertPropertyEquals(result, 'referrerSource', 'newsletter');
            assertPropertyEquals(result, 'referrerMedium', 'email');
            assertPropertyEquals(result, 'referrerUrl', 'example.com');
        });

        it('recognizes Ghost Newsletter sources', () => {
            const result: ReferrerData = parse('https://example.com', {}, 'site-newsletter');
            should.exist(result);
            assertPropertyEquals(result, 'referrerSource', 'site newsletter');
            assertPropertyEquals(result, 'referrerMedium', 'Email');
            assertPropertyEquals(result, 'referrerUrl', 'example.com');
        });
    });
}); 
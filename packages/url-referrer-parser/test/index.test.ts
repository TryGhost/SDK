import should from 'should';
import { expect, describe, it } from 'vitest';
import { parse, ReferrerParser, ReferrerData } from '../index';

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
            result.referrerSource!.should.equal('Google');
            result.referrerMedium!.should.equal('search');
            result.referrerUrl!.should.equal('www.google.com');
        });

        it('accepts configuration options', () => {
            const result: ReferrerData = parse('https://example.com/blog', {
                siteUrl: 'https://example.com'
            });
            should.exist(result);
            result.should.have.properties(['referrerSource', 'referrerMedium', 'referrerUrl']);
            result.referrerSource!.should.equal('Direct');
            should.equal(result.referrerMedium, null);
            should.equal(result.referrerUrl, null);
        });

        it('handles null and invalid URLs', () => {
            const result: ReferrerData = parse(null as unknown as string);
            should.exist(result);
            result.referrerSource!.should.equal('Direct');
            should.equal(result.referrerMedium, null);
            should.equal(result.referrerUrl, null);

            const invalidResult: ReferrerData = parse('not-a-url');
            should.exist(invalidResult);
            invalidResult.referrerSource!.should.equal('Direct');
            should.equal(invalidResult.referrerMedium, null);
            should.equal(invalidResult.referrerUrl, null);
        });
    });
}); 
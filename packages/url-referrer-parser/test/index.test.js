const should = require('should');
const {parse, ReferrerParser} = require('../index');

describe('referrer-parser', function () {
    describe('exports', function () {
        it('exports parse function', function () {
            should.exist(parse);
            parse.should.be.a.Function();
        });

        it('exports ReferrerParser class', function () {
            should.exist(ReferrerParser);
            ReferrerParser.should.be.a.Function();
            new ReferrerParser().should.be.an.instanceOf(ReferrerParser);
        });
    });

    describe('parse function', function () {
        it('parses referrer URLs', function () {
            const result = parse('https://www.google.com/search?q=ghost+cms');
            should.exist(result);
            result.should.have.properties(['referrerSource', 'referrerMedium', 'referrerUrl']);
            result.referrerSource.should.equal('Google');
            result.referrerMedium.should.equal('search');
            result.referrerUrl.should.equal('www.google.com');
        });

        it('accepts configuration options', function () {
            const result = parse('https://example.com/blog', {
                siteUrl: 'https://example.com'
            });
            should.exist(result);
            result.should.have.properties(['referrerSource', 'referrerMedium', 'referrerUrl']);
            result.referrerSource.should.equal('Direct');
            should.equal(result.referrerMedium, null);
            should.equal(result.referrerUrl, null);
        });

        it('handles null and invalid URLs', function () {
            const result = parse(null);
            should.exist(result);
            result.referrerSource.should.equal('Direct');
            should.equal(result.referrerMedium, null);
            should.equal(result.referrerUrl, null);

            const invalidResult = parse('not-a-url');
            should.exist(invalidResult);
            invalidResult.referrerSource.should.equal('Direct');
            should.equal(invalidResult.referrerMedium, null);
            should.equal(invalidResult.referrerUrl, null);
        });
    });
}); 
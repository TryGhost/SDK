const isSSL = require('../../../src/utils/is-ssl');

describe('isSSL', function () {
    it('detects https protocol correctly', function () {
        isSSL('https://my.blog.com').should.be.true();
        isSSL('http://my.blog.com').should.be.false();
        isSSL('http://my.https.com').should.be.false();
    });
});

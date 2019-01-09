require('./utils');

const socialUrls = require('../').utils.socialUrls;

describe.only('Social URLs', function () {
    describe('Twitter', function () {
        it('returns correct Twitter URL for a username', function () {
            socialUrls.twitter('@tryghost')
                .should.eql('https://twitter.com/tryghost');
        });
    });
    describe('Facebook', function () {
        it('returns correct Facebook URL for a username', function () {
            socialUrls.facebook('ghost')
                .should.eql('https://www.facebook.com/ghost');
        });
    });
});

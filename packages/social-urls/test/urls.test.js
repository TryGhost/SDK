// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('./utils');

const should = require('should');
const social = require('../lib/index');

describe('lib/social: urls', function () {
    // Verify each platform has a URL function
    it('should have a twitter url function', function () {
        should.exist(social.twitter);
    });

    it('should have a x url function', function () {
        should.exist(social.x);
    });

    it('should have a facebook url function', function () {
        should.exist(social.facebook);
    });

    it('should have a threads url function', function () {
        should.exist(social.threads);
    });

    it('should have a bluesky url function', function () {
        should.exist(social.bluesky);
    });

    it('should have a mastodon url function', function () {
        should.exist(social.mastodon);
    });

    it('should have a tiktok url function', function () {
        should.exist(social.tiktok);
    });

    it('should have a youtube url function', function () {
        should.exist(social.youtube);
    });

    it('should have an instagram url function', function () {
        should.exist(social.instagram);
    });

    it('should have a linkedin url function', function () {
        should.exist(social.linkedin);
    });

    describe('twitter', function () {
        it('should return a correct concatenated URL', function () {
            social.twitter('@myusername').should.eql('https://x.com/myusername');
        });

        it('should return a url without an @ sign if one is provided', function () {
            social.twitter('myusername').should.eql('https://x.com/myusername');
        });
    });

    describe('x', function () {
        it('should return a correct concatenated URL', function () {
            social.x('@myusername').should.eql('https://x.com/myusername');
        });

        it('should return a url without an @ sign if one is provided', function () {
            social.x('myusername').should.eql('https://x.com/myusername');
        });
    });

    describe('facebook', function () {
        it('should return a correct concatenated URL', function () {
            social.facebook('myusername').should.eql('https://www.facebook.com/myusername');
        });

        it('should return a correct concatenated URL for usernames with slashes', function () {
            social.facebook('page/xxx/123').should.eql('https://www.facebook.com/page/xxx/123');
        });

        it('should return a correct concatenated URL for usernames which start with a slash', function () {
            social.facebook('/page/xxx/123').should.eql('https://www.facebook.com/page/xxx/123');
        });
    });

    describe('threads', function () {
        it('should return a correct concatenated URL', function () {
            social.threads('@myusername').should.eql('https://www.threads.net/@myusername');
        });

        it('should return a correct URL for usernames without @', function () {
            social.threads('myusername').should.eql('https://www.threads.net/@myusername');
        });
    });

    describe('bluesky', function () {
        it('should return a correct concatenated URL', function () {
            social.bluesky('myusername').should.eql('https://bsky.app/profile/myusername');
        });

        it('should handle domain-based usernames', function () {
            social.bluesky('user.domain.com').should.eql('https://bsky.app/profile/user.domain.com');
        });
    });

    describe('mastodon', function () {
        it('should return a correct concatenated URL for instance-specific handle', function () {
            social.mastodon('mastodon.social/@myusername').should.eql('https://mastodon.social/@myusername');
        });

        it('should return a correct concatenated URL for federated handle', function () {
            social.mastodon('mastodon.social/@user@instance.social').should.eql('https://mastodon.social/@user@instance.social');
        });

        it('should handle subdomains in instance URLs', function () {
            social.mastodon('eu.mastodon.green/@eco').should.eql('https://eu.mastodon.green/@eco');
        });
    });

    describe('tiktok', function () {
        it('should return a correct concatenated URL', function () {
            social.tiktok('@myusername').should.eql('https://www.tiktok.com/@myusername');
        });

        it('should return a correct URL for usernames without @', function () {
            social.tiktok('myusername').should.eql('https://www.tiktok.com/@myusername');
        });

        it('should handle usernames with periods and underscores', function () {
            social.tiktok('@john.smith_123').should.eql('https://www.tiktok.com/@john.smith_123');
        });
    });

    describe('youtube', function () {
        it('should return a correct concatenated URL for handle-based username', function () {
            social.youtube('@myusername').should.eql('https://www.youtube.com/@myusername');
        });

        it('should return a correct concatenated URL for legacy user-based username', function () {
            social.youtube('user/myusername').should.eql('https://www.youtube.com/user/myusername');
        });

        it('should return a correct concatenated URL for channel ID', function () {
            social.youtube('channel/UC4QobU6STFB0P71PMvOGN5A').should.eql('https://www.youtube.com/channel/UC4QobU6STFB0P71PMvOGN5A');
        });
    });

    describe('instagram', function () {
        it('should return a correct concatenated URL', function () {
            social.instagram('myusername').should.eql('https://www.instagram.com/myusername');
        });

        it('should handle usernames with periods and underscores', function () {
            social.instagram('john.smith_123').should.eql('https://www.instagram.com/john.smith_123');
        });
    });

    describe('linkedin', function () {
        it('should return a correct concatenated URL for personal profile', function () {
            social.linkedin('in/myusername').should.eql('https://www.linkedin.com/in/myusername');
        });

        it('should return a correct concatenated URL for company profile', function () {
            social.linkedin('company/mycompany').should.eql('https://www.linkedin.com/company/mycompany');
        });

        it('should return a correct concatenated URL for school profile', function () {
            social.linkedin('school/myschool').should.eql('https://www.linkedin.com/school/myschool');
        });

        it('should return a correct concatenated URL for a legacy pub profile', function () {
            social.linkedin('pub/johnsmith/12/34/567').should.eql('https://www.linkedin.com/pub/johnsmith/12/34/567');
        });

        it('should handle usernames with hyphens', function () {
            social.linkedin('in/john-smith-123').should.eql('https://www.linkedin.com/in/john-smith-123');
        });

        it('should default to in/ when username does not start with in/, company/, school/, or pub/', function () {
            social.linkedin('myusername').should.eql('https://www.linkedin.com/in/myusername');
        });
    });
});

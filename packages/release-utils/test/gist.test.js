require('./utils');

const path = require('path');
const nock = require('nock');
const lib = require('../lib');

const CHANGELOG = path.join(__dirname, 'fixtures', 'changelog.md');

describe('Gist', function () {
    before(function () {
        nock.disableNetConnect();
    });

    after(function () {
        nock.enableNetConnect();
    });

    afterEach(function () {
        nock.cleanAll();
    });

    describe('create', function () {
        it('throws when required options are missing', function (done) {
            try {
                lib.gist.create();
            } catch (err) {
                err.message.should.eql('Missing options: changelogPath, gistName, gistDescription, github, github.token, userAgent');
                return done();
            }

            throw new Error('should fail');
        });

        it('creates a public gist and returns its url', function () {
            const scope = nock('https://api.github.com')
                .post('/gists', (body) => {
                    return body.public === true;
                })
                .reply(201, {html_url: 'https://gist.github.com/abc123'});

            return lib.gist.create({
                changelogPath: CHANGELOG,
                gistName: 'changelog.md',
                gistDescription: 'Ghost changelog',
                github: {token: 'foo'},
                userAgent: 'Ghost'
            }).then((result) => {
                result.should.eql({gistUrl: 'https://gist.github.com/abc123'});
                scope.done();
            });
        });

        it('honours isPublic: false', function () {
            const scope = nock('https://api.github.com')
                .post('/gists', (body) => {
                    return body.public === false;
                })
                .reply(201, {html_url: 'https://gist.github.com/secret'});

            return lib.gist.create({
                changelogPath: CHANGELOG,
                gistName: 'changelog.md',
                gistDescription: 'Ghost changelog',
                github: {token: 'foo'},
                userAgent: 'Ghost',
                isPublic: false
            }).then((result) => {
                result.should.eql({gistUrl: 'https://gist.github.com/secret'});
                scope.done();
            });
        });
    });
});

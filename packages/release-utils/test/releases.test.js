// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('./utils');

const path = require('path');
const nock = require('nock');
const lib = require('../lib');

const CHANGELOG = path.join(__dirname, 'fixtures', 'changelog.md');
const ZIP = path.join(__dirname, 'fixtures', 'release.zip');

const RELEASES_URI = 'https://api.github.com/repos/TryGhost/Ghost/releases';

describe('Releases', function () {
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
                lib.releases.create();
            } catch (err) {
                err.message.should.eql('Missing options: changelogPath, github, github.token, userAgent, uri, tagName, releaseName');
                return done();
            }

            throw new Error('should fail');
        });

        it('creates a draft release from a single changelog path', function () {
            let sentBody;
            const scope = nock('https://api.github.com')
                .post('/repos/TryGhost/Ghost/releases', (body) => {
                    sentBody = body;
                    return true;
                })
                .reply(201, {id: 1, html_url: 'https://github.com/release/1', upload_url: 'https://uploads/1'});

            return lib.releases.create({
                changelogPath: CHANGELOG,
                github: {token: 'foo'},
                userAgent: 'Ghost',
                uri: RELEASES_URI,
                tagName: 'v1.0.0',
                releaseName: '1.0.0'
            }).then((result) => {
                result.should.eql({
                    id: 1,
                    releaseUrl: 'https://github.com/release/1',
                    uploadUrl: 'https://uploads/1'
                });
                // defaults
                sentBody.draft.should.eql(true);
                sentBody.prerelease.should.eql(false);
                sentBody.target_commitish.should.eql('main');
                scope.done();
            });
        });

        it('supports an array of changelog paths, gistUrl, extraText & option overrides', function () {
            let sentBody;
            const scope = nock('https://api.github.com')
                .post('/repos/TryGhost/Ghost/releases', (body) => {
                    sentBody = body;
                    return true;
                })
                .reply(201, {id: 2, html_url: 'https://github.com/release/2', upload_url: 'https://uploads/2'});

            return lib.releases.create({
                changelogPath: [{changelogPath: CHANGELOG}, {changelogPath: CHANGELOG}],
                github: {token: 'foo'},
                userAgent: 'Ghost',
                uri: RELEASES_URI,
                tagName: 'v2.0.0',
                releaseName: '2.0.0',
                gistUrl: 'https://gist.github.com/abc123',
                extraText: 'Thanks to all contributors!',
                draft: false,
                prerelease: true,
                targetRef: 'release-2.0'
            }).then((result) => {
                result.id.should.eql(2);
                sentBody.draft.should.eql(false);
                sentBody.prerelease.should.eql(true);
                sentBody.target_commitish.should.eql('release-2.0');
                sentBody.body.should.match(/full change log/);
                sentBody.body.should.match(/Thanks to all contributors!/);
                scope.done();
            });
        });
    });

    describe('uploadZip', function () {
        it('no options', function (done) {
            try {
                lib.releases.uploadZip();
            } catch (err) {
                err.message.should.eql('Missing options: zipPath, github, github.token, userAgent, uri');
                return done();
            }

            throw new Error('should fail');
        });

        it('missing options', function (done) {
            try {
                lib.releases.uploadZip({zipPath: 'test', github: {}});
            } catch (err) {
                err.message.should.eql('Missing options: github.token, userAgent, uri');
                return done();
            }

            throw new Error('should fail');
        });

        it('uploads the zip and resolves with the download url', function () {
            const scope = nock('https://uploads.github.com')
                .post('/repos/TryGhost/Ghost/releases/1/assets')
                .reply(201, {browser_download_url: 'https://github.com/download/release.zip'});

            return lib.releases.uploadZip({
                zipPath: ZIP,
                github: {token: 'foo'},
                userAgent: 'Ghost',
                uri: 'https://uploads.github.com/repos/TryGhost/Ghost/releases/1/assets'
            }).then((result) => {
                result.should.eql({downloadUrl: 'https://github.com/download/release.zip'});
                scope.done();
            });
        });

        it('rejects when the upload request errors', function () {
            const scope = nock('https://uploads.github.com')
                .post('/repos/TryGhost/Ghost/releases/1/assets')
                .replyWithError('network boom');

            return lib.releases.uploadZip({
                zipPath: ZIP,
                github: {token: 'foo'},
                userAgent: 'Ghost',
                uri: 'https://uploads.github.com/repos/TryGhost/Ghost/releases/1/assets'
            }).then(() => {
                throw new Error('should have rejected');
            }).catch((err) => {
                err.message.should.match(/network boom/);
                scope.done();
            });
        });
    });

    describe('get', function () {
        it('throws when required options are missing', function (done) {
            try {
                lib.releases.get();
            } catch (err) {
                err.message.should.eql('Missing options: userAgent, uri');
                return done();
            }

            throw new Error('should fail');
        });

        it('fetches and returns the release payload', function () {
            const scope = nock('https://api.github.com')
                .get('/repos/TryGhost/Ghost/releases/latest')
                .reply(200, {tag_name: 'v1.0.0'});

            return lib.releases.get({
                userAgent: 'Ghost',
                uri: 'https://api.github.com/repos/TryGhost/Ghost/releases/latest'
            }).then((response) => {
                response.tag_name.should.eql('v1.0.0');
                scope.done();
            });
        });
    });
});

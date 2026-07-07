require('./utils');

const fs = require('fs');
const path = require('path');
const {Changelog} = require('../lib');

describe('Changelog', function () {
    it('throws when required constructor options are missing', function () {
        try {
            /* eslint-disable no-new */
            new Changelog();
            throw new Error('should have thrown');
        } catch (err) {
            err.message.should.eql('Missing options: folder, changelogPath');
        }
    });

    it('throws when required write options are missing', function () {
        const changelog = new Changelog({
            changelogPath: path.join(process.cwd(), 'changelog.md'),
            folder: process.cwd()
        });

        try {
            changelog.write({});
            throw new Error('should have thrown');
        } catch (err) {
            err.message.should.eql('Missing options: githubRepoPath, lastVersion');
        }
    });

    it('can generate changelog.md', function () {
        const changelogPath = path.join(process.cwd(), 'changelog.md');

        const changelog = new Changelog({
            changelogPath: changelogPath,
            folder: process.cwd()
        });

        changelog
            .write({
                githubRepoPath: `https://github.com/TryGhost/SDK`,
                lastVersion: '@tryghost/release-utils@0.6.3'
            })
            .sort()
            .clean();

        try {
            fs.unlinkSync(changelogPath);
            fs.unlinkSync(changelogPath + '.bk');
        } catch (err) {
            should.not.exist(err);
        }
    });

    it('can append to an existing changelog', function () {
        const changelogPath = path.join(process.cwd(), 'changelog.md');

        const changelog = new Changelog({
            changelogPath: changelogPath,
            folder: process.cwd()
        });

        changelog
            .write({
                githubRepoPath: `https://github.com/TryGhost/SDK`,
                lastVersion: '@tryghost/release-utils@0.6.3'
            })
            .write({
                githubRepoPath: `https://github.com/TryGhost/SDK`,
                lastVersion: '@tryghost/release-utils@0.6.3',
                append: true
            })
            .sort()
            .clean();

        try {
            fs.unlinkSync(changelogPath);
            fs.unlinkSync(changelogPath + '.bk');
        } catch (err) {
            should.not.exist(err);
        }
    });
});

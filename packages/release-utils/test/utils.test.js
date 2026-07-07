// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('./utils');

const path = require('path');
const lib = require('../lib');

const CHANGELOG = path.join(__dirname, 'fixtures', 'changelog.md');
const CHANGELOG_NO_EMOJI = path.join(__dirname, 'fixtures', 'changelog-no-emoji.md');

describe('Utils', function () {
    describe('filterEmojiCommits', function () {
        it('throws when passed a non-array', function () {
            try {
                lib.utils.filterEmojiCommits('not an array');
                throw new Error('should have thrown');
            } catch (err) {
                err.message.should.eql('Expected array of strings.');
            }
        });

        it('no emoji commits found', function () {
            const result = lib.utils.filterEmojiCommits([
                '1234567890 * [f6f35ebcd](https://github.com/TryGhost/Ghost/commit/f6f35ebcd) Version bump to 2.17.1 - Name',
                '1234567890 * [f6f35ebcd](https://github.com/TryGhost/Ghost/commit/f6f35ebcd) Version bump to 2.17.1 - Name'
            ]);

            result.length.should.eql(0);
        });

        it('emoji commits found', function () {
            const result = lib.utils.filterEmojiCommits([
                '1234567890 * [f6f35ebcd](https://github.com/TryGhost/Ghost/commit/f6f35ebcd) Version bump to 2.17.1 - Name',
                '1234567890 * [f6f35ebcd](https://github.com/TryGhost/Ghost/commit/f6f35ebcd) 👻 Version bump to 2.17.1 - Name'
            ]);

            result.length.should.eql(1);
        });

        it('emoji commits found: just another format', function () {
            const result = lib.utils.filterEmojiCommits([
                '* [f6f35ebcd](https://github.com/TryGhost/Ghost/commit/f6f35ebcd) Version bump to 2.17.1 - Name',
                '* [f6f35ebcd](https://github.com/TryGhost/Ghost/commit/f6f35ebcd) 👻 Version bump to 2.17.1 - Name',
                '* [e456ae2](https://github.com/kirrg001/testing/commit/e456ae2) 🐝 tzZZ - kirrg001'
            ]);

            result.length.should.eql(2);
        });
    });

    describe('sortByEmoji', function () {
        it('throws when passed a non-array', function () {
            try {
                lib.utils.sortByEmoji('not an array');
                throw new Error('should have thrown');
            } catch (err) {
                err.message.should.eql('Expected array of strings.');
            }
        });

        it('sorts lines by the configured emoji order', function () {
            const content = [
                '* 🔒 Patched a security issue',
                '* 💡 Introduced an idea',
                '* 🐛 Fixed a bug'
            ];

            lib.utils.sortByEmoji(content);

            // The comparator sorts by descending emojiOrder index, so the emoji
            // that appears last in emojiOrder (🔒) sorts first and 💡 sorts last
            content[0].should.startWith('* 🔒');
            content[content.length - 1].should.startWith('* 💡');
        });
    });

    describe('checkMissingOptions', function () {
        it('does not throw when all required fields are present', function () {
            lib.utils.checkMissingOptions({a: 1, b: {c: 2}}, 'a', 'b.c');
        });

        it('throws listing every missing field', function () {
            try {
                lib.utils.checkMissingOptions({a: 1}, 'a', 'b', 'c');
                throw new Error('should have thrown');
            } catch (err) {
                err.message.should.eql('Missing options: b, c');
            }
        });
    });

    describe('getFinalChangelog', function () {
        it('returns the filtered & sorted emoji commits by default', function () {
            const result = lib.utils.getFinalChangelog({changelogPath: CHANGELOG});

            // Only the two emoji commits survive, sorted by descending emojiOrder
            // index (✨ appears later in emojiOrder than 🐛, so it sorts first)
            result.length.should.eql(2);
            result[0].should.startWith('* ✨');
            result[1].should.startWith('* 🐛');
        });

        it('prepends optional content lines', function () {
            const result = lib.utils.getFinalChangelog({
                changelogPath: CHANGELOG,
                content: ['# Heading', '']
            });

            result[0].should.eql('# Heading');
            result[1].should.eql('');
            result.length.should.eql(4);
        });

        it('keeps the raw changelog when filterEmojiCommits is false', function () {
            const result = lib.utils.getFinalChangelog({
                changelogPath: CHANGELOG,
                filterEmojiCommits: false
            });

            // No filtering: all three (non-empty) lines are retained
            result.filter(Boolean).length.should.eql(3);
        });

        it('falls back to a default message when nothing remains', function () {
            const result = lib.utils.getFinalChangelog({changelogPath: CHANGELOG_NO_EMOJI});

            result.should.eql(['This release contains fixes for minor bugs and issues reported by Ghost users.']);
        });
    });
});

// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('./utils');

const readingTimeHelper = require('../').readingTime;

const almostOneMinute =
    '<p>Ghost has a number of different user roles for your team</p>' +
    '<h3 id="authors">Authors</h3><p>The base user level in Ghost is an author. Authors can write posts,' +
    ' edit their own posts, and publish their own posts. Authors are <strong>trusted</strong> users. If you ' +
    'don\'t trust users to be allowed to publish their own posts, you shouldn\'t invite them to Ghost admin.</p>' +
    '<h3 id="editors">Editors</h3><p>Editors are the 2nd user level in Ghost. Editors can do everything that an' +
    ' Author can do, but they can also edit and publish the posts of others - as well as their own. Editors can also invite new' +
    ' authors to the site.</p><h3 id="administrators">Administrators</h3><p>The top user level in Ghost is Administrator.' +
    ' Again, administrators can do everything that Authors and Editors can do, but they can also edit all site settings ' +
    'and data, not just content. Additionally, administrators have full access to invite, manage or remove any other' +
    ' user of the site.</p><h3 id="theowner">The Owner</h3><p>There is only ever one owner of a Ghost site. ' +
    'The owner is a special user which has all the same permissions as an Administrator, but with two exceptions: ' +
    'The Owner can never be deleted. And in some circumstances the owner will have access to additional special settings ' +
    'if applicable — for example, billing details, if using Ghost(Pro).</p><hr><p>It\'s a good idea to ask all of your' +
    ' users to fill out their user profiles, including bio and social links. These will populate rich structured data ' +
    'for posts and generally create more opportunities for themes to fully populate their design.</p>';

const almostOneAndAHalfMinute = almostOneMinute +
    '<div>' +
    '<p>Ghost has a number of different user roles for your team</p>' +
    '<h3 id="authors">Authors</h3><p>The base user level in Ghost is an author. Authors can write posts,' +
    ' edit their own posts, and publish their own posts. Authors are <strong>trusted</strong> users. If you ' +
    'don\'t trust users to be allowed to publish their own posts, you shouldn\'t invite them to Ghost admin.</p>' +
    '<h3 id="editors">Editors</h3><p>Editors are the 2nd user level in Ghost. Editors can do everything that an' +
    ' Author can do, but they can also edit and publish the posts of others - as well as their own. Editors can also invite new' +
    ' authors to the site.</p><h3 id="administrators">Administrators</h3><p>The top user level in Ghost is Administrator.' +
    ' Again, administrators can do everything that Authors and Editors can do, but they can also edit all site settings ' +
    'and data, not just content. Additionally, administrators have full access to invite</p>' +
    '</div>';

describe('readingTime helper', function () {
    it('returns reading time for less than one minute text as one minute', function () {
        const post = {html: almostOneMinute};
        const result = readingTimeHelper(post);

        result.should.equal('1 min read');
    });

    it('returns reading time for one minute text as one minute', function () {
        const post = {
            html: almostOneMinute +
                    'This needed about twenty-five more words before passing the one minute reading time, ' +
                    'since the word count was 250, and the average speed is 275.'
        };
        const result = readingTimeHelper(post);

        result.should.equal('1 min read');
    });

    it('returns reading time for just under 1.5 minutes text as one minute', function () {
        const post = {html: almostOneAndAHalfMinute};
        const result = readingTimeHelper(post);

        result.should.equal('1 min read');
    });

    it('adds time for feature image', function () {
        const post = {
            html: almostOneAndAHalfMinute,
            feature_image: '/content/images/someimage.jpg'
        };
        const result = readingTimeHelper(post);

        // The reading time for this HTML snippet would be 89 seconds without the image
        // Adding the 12 additional seconds for the image results in a readng time of over 1.5 minutes, rounded to 2
        result.should.equal('2 min read');
    });

    it('adds time for inline images', function () {
        const post = {html: almostOneAndAHalfMinute + '<img src="test.png">'};
        const result = readingTimeHelper(post);

        // The reading time for this HTML snippet would be 89 seconds without the image
        // Adding the 12 additional seconds for the image results in a readng time of over 1.5 minutes, rounded to 2
        result.should.equal('2 min read');
    });

    it('accepts `minute` option', function () {
        const post = {html: almostOneMinute};
        const result = readingTimeHelper(post, {minute: 'minutes: 1'});

        result.should.equal('minutes: 1');
    });

    it('accepts `minutes` option', function () {
        const post = {html: almostOneAndAHalfMinute + '<img src="test.png">'};
        const result = readingTimeHelper(post, {minutes: 'minutes: %'});

        result.should.equal('minutes: 2');
    });

    it('returns blank string when input does not resemble a post ({html})', function () {
        const post = {
            author: {
                name: 'abc 123',
                slug: 'abc123'
            }
        };
        const result = readingTimeHelper(post);

        result.should.equal('');
    });

    it('accepts and uses pre-filled reading_time', function () {
        const post = {
            html: almostOneAndAHalfMinute + '<img src="test.png">',
            reading_time: 200
        };
        const result = readingTimeHelper(post);

        result.should.equal('200 min read');
    });

    it('accepts and uses pre-filled reading_time even when html is not present', function () {
        const post = {
            reading_time: 200
        };
        const result = readingTimeHelper(post);

        result.should.equal('200 min read');
    });
});

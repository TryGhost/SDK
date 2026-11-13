require('./utils');

const helperUtils = require('../').utils;

describe('Word Count', function () {
    it('[success] can count words', function () {
        var html = 'Some words here',
            result = helperUtils.countWords(html);

        result.should.equal(3);
    });

    it('[success] sanitized HTML tags', function () {
        var html = '<p>This is a text example! Count me in ;)</p>',
            result = helperUtils.countWords(html);

        result.should.equal(8);
    });

    it('[success] sanitized non alpha-numeric characters', function () {
        var html = '<p>This is a text example! I love Döner. Especially number 875.</p>',
            result = helperUtils.countWords(html);

        result.should.equal(11);
    });

    it('[success] counted Chinese characters', function () {
        var html = '<p>我今天在家吃了好多好多好吃的，现在的我非常开心非常满足</p>',
            result = helperUtils.countWords(html);

        result.should.equal(26);
    });

    it('[success] sanitized white space correctly', function () {
        var html = ' <p> This is a text example!\n Count   me in ;)</p> ',
            result = helperUtils.countWords(html);

        result.should.equal(8);
    });

    it('[success] counted Arabic characters', function () {
        var html = '<p>انا هذا رائع جدا يا صاح</p>',
            result = helperUtils.countWords(html);

        result.should.equal(6);
    });

    it('[success] counted Hebrew characters', function () {
        var html = '<p>מנסה לגרום לזה לעבוד</p>',
            result = helperUtils.countWords(html);

        result.should.equal(4);
    });

    it('[success] sanitized quoted, nested and unclosed tags like the original regular expression', function () {
        // a `>` inside of a quoted attribute doesn't close the tag
        helperUtils.countWords('one <a title="two > three">four</a>').should.equal(2);
        helperUtils.countWords('one <a title=\'two > three\'>four</a>').should.equal(2);
        // a tag spans until the first `>`, even across another `<`
        helperUtils.countWords('one < two <b>three</b>').should.equal(2);
        // an unclosed quote stops the tag from being a tag
        helperUtils.countWords('one <a title="two>three</a>').should.equal(5);
        // ...but tags inside of it are still found
        helperUtils.countWords('one <a title=\'two <b>three').should.equal(5);
        // unclosed tags are kept
        helperUtils.countWords('one <two three').should.equal(3);
        // tags are replaced by a space
        helperUtils.countWords('one<br>two').should.equal(2);
        helperUtils.countWords('<p\nclass="one">two</p>').should.equal(1);
    });

    it('[success] can count words of a Handlebars.SafeString', function () {
        helperUtils.countWords({string: '<p>Some words here</p>'}).should.equal(3);
    });

    it('[success] handles a large amount of unclosed tags quickly', function () {
        // the original regular expression needed seconds for each of these
        helperUtils.countWords('<'.repeat(30000) + ' word').should.equal(1);
        helperUtils.countWords('<"'.repeat(30000) + ' word').should.equal(1);
        helperUtils.countWords('<\''.repeat(30000) + ' word').should.equal(1);
        helperUtils.countWords('<a "'.repeat(30000) + ' word').should.equal(30001);
    });

    it('[failure] throws for input that is not a string', function () {
        (function () {
            helperUtils.countWords(['Some words here']);
        }).should.throw(TypeError);

        (function () {
            helperUtils.countWords({string: 5});
        }).should.throw(TypeError);
    });
});

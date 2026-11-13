require('./utils');

const helperUtils = require('../').utils;

describe('Image Count', function () {
    it('[success] can count images', function () {
        var html = '<p>This is a <img src="hello.png"> text example! Count me in ;)</p><img src="hello.png">',
            result = helperUtils.countImages(html);

        result.should.equal(2);
    });

    it('[success] counts quoted, nested and unclosed images like the original regular expression', function () {
        helperUtils.countImages('<img src="a > b.png"><img alt=\'>\' src=a.png/>').should.equal(2);
        helperUtils.countImages('<img\nsrc="a.png"\n/>').should.equal(1);
        // an image needs at least one character after `<img`
        helperUtils.countImages('<img><img/>').should.equal(1);
        // unclosed images are not counted
        helperUtils.countImages('<img src="a.png"').should.equal(0);
        // ...but images after an unclosed quote are
        helperUtils.countImages('<img src="a.png><img src="b.png">').should.equal(1);
        helperUtils.countImages('<img alt=\'<img src="a.png"><img src="b.png">').should.equal(2);
        // an image spans until the first `>`, even across another `<img`
        helperUtils.countImages('<img <img src="a.png">').should.equal(1);
        // only the lowercase `<img` is looked for, whatever comes after it
        helperUtils.countImages('<IMG src="a.png"><imgur>').should.equal(1);
    });

    it('[success] can count images of a Handlebars.SafeString', function () {
        helperUtils.countImages({string: '<img src="hello.png">'}).should.equal(1);
    });

    it('[success] handles a large amount of unclosed images quickly', function () {
        // the original regular expression needed seconds for each of these
        helperUtils.countImages('<img'.repeat(30000)).should.equal(0);
        helperUtils.countImages('<img "'.repeat(30000)).should.equal(0);
        helperUtils.countImages('<img \''.repeat(30000)).should.equal(0);
        helperUtils.countImages('<img x="<img y=\''.repeat(30000)).should.equal(0);
        helperUtils.countImages('<img src="hello.png">' + '<img'.repeat(30000)).should.equal(1);
    });

    it('[failure] throws for input that is not a string', function () {
        (function () {
            helperUtils.countImages(['<img src="hello.png">']);
        }).should.throw(TypeError);

        (function () {
            helperUtils.countImages({string: 5});
        }).should.throw(TypeError);
    });
});

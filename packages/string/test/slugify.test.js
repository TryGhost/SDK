require('./utils');

const slugify = require('../lib').slugify;

describe('Slugify', function () {
    var options = {};

    it('should remove beginning and ending whitespace', function () {
        var result = slugify(' stringwithspace ', options);
        result.should.equal('stringwithspace');
    });

    it('can handle null strings', function () {
        var result = slugify(null);
        result.should.equal('');
    });

    it('should remove non ascii characters', function () {
        var result = slugify('howtowin✓', options);
        result.should.equal('howtowin');
    });

    it('should replace spaces with dashes', function () {
        var result = slugify('how to win', options);
        result.should.equal('how-to-win');
    });

    it('should replace most special characters with dashes', function () {
        var result = slugify('a:b/c?d#e[f]g!h$i&j(k)l*m+n,o;{p}=q\\r%s<t>u|v^w~x£y"z@1.2`3', options);
        result.should.equal('a-b-c-d-e-f-g-h-i-j-k-l-m-n-o-p-q-r-s-t-u-v-w-x-y-z-1-2-3');
    });

    it('should replace all of the html4 compat symbols in ascii except hyphen and underscore', function () {
        // note: This is missing the soft-hyphen char that isn't much-liked by linters/browsers/etc,
        // it passed the test before it was removed
        var result = slugify('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿');
        result.should.equal('_-c-y-ss-c-a-r-deg-23up-1o-1-41-23-4');
    });

    it('should replace all of the foreign chars in ascii', function () {
        var result = slugify('ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ');
        result.should.equal('aaaaaaaeceeeeiiiidnoooooxouuuuuthssaaaaaaaeceeeeiiiidnooooo-ouuuuythy');
    });

    it('should remove control characters', function () {
        var result = slugify('control:\x07notcontrol:\xB5');
        result.should.equal('control-notcontrol-u');
    });

    it('should remove special characters at the beginning of a string', function () {
        var result = slugify('.Not special', options);
        result.should.equal('not-special');
    });

    it('should remove apostrophes ', function () {
        var result = slugify('how we shouldn\'t be', options);
        result.should.equal('how-we-shouldnt-be');
    });

    it('should convert to lowercase', function () {
        var result = slugify('This has Upper Case', options);
        result.should.equal('this-has-upper-case');
    });

    it('should convert multiple dashes into a single dash', function () {
        var result = slugify('This :) means everything', options);
        result.should.equal('this-means-everything');
    });

    it('should remove trailing dashes from the result', function () {
        var result = slugify('This.', options);
        result.should.equal('this');
    });

    it('should handle pound signs', function () {
        var result = slugify('WHOOPS! I spent all my £ again!', options);
        result.should.equal('whoops-i-spent-all-my-again');
    });

    it('should properly handle unicode punctuation conversion', function () {
        var result = slugify('に間違いがないか、再度確認してください。再読み込みしてください。', options);
        result.should.equal('nijian-wei-iganaika-zai-du-que-ren-sitekudasai-zai-du-miip-misitekudasai');
    });

    it('should not lose or convert dashes if options are passed with truthy importing flag', function () {
        var result,
            options = {requiredChangesOnly: true};
        result = slugify('-slug-with-starting-ending-and---multiple-dashes-', options);
        result.should.equal('-slug-with-starting-ending-and---multiple-dashes-');
    });

    it('should still remove/convert invalid characters when passed options with truthy importing flag', function () {
        var result,
            options = {requiredChangesOnly: true};
        result = slugify('-slug-&with-✓-invalid-characters-に\'', options);
        result.should.equal('-slug--with--invalid-characters-ni');
    });
});

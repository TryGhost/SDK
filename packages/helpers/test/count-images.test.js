require('./utils');

const helperUtils = require('../').utils;

describe('Image Count', function () {
    it('[success] can count images', function () {
        var html = '<p>This is a <img src="hello.png"> text example! Count me in ;)</p><img src="hello.png">',
            result = helperUtils.countImages(html);

        result.should.equal(2);
    });
});

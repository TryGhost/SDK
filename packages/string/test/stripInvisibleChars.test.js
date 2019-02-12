require('./utils');

const stripInvisibleChars = require('../lib').stripInvisibleChars;

describe('Strip Invisible Chars', function () {
    it('can handle null strings', function () {
        var result = stripInvisibleChars(null);
        result.should.equal('');
    });

    it('should remove control characters', function () {
        var result = stripInvisibleChars('control:\x07notcontrol:\xB5');
        result.should.equal('control:notcontrol:µ');
    });
});

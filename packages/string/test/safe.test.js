require('./utils');

const safe = require('../lib').safe;

describe('Safe', function () {
    var options = {};

    it('can handle null strings', function () {
        var result = safe(null);
        result.should.equal('');
    });

    it('should remove beginning and ending whitespace', function () {
        var result = safe(' stringwithspace ', options);
        result.should.equal('stringwithspace');
    });

    it('should remove control characters', function () {
        var result = safe('control:\x07notcontrol:\xB5');
        result.should.equal('control:notcontrol:µ');
    });
});

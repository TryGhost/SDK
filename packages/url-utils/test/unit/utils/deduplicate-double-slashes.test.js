require('../../utils');

const deduplicateDoubleSlashes = require('../../../cjs/utils/deduplicate-double-slashes');

describe('utils: deduplicateDoubleSlashes()', function () {
    it('should deduplicate double slashes in URL', function () {
        deduplicateDoubleSlashes('http://example.com//path//to//file.png')
            .should.eql('http://example.com/path/to/file.png');
    });

    it('should deduplicate multiple consecutive slashes', function () {
        deduplicateDoubleSlashes('http://example.com///path////to///file.png')
            .should.eql('http://example.com/path/to/file.png');
    });

    it('should handle path with no double slashes', function () {
        deduplicateDoubleSlashes('http://example.com/path/to/file.png')
            .should.eql('http://example.com/path/to/file.png');
    });

    it('should handle relative paths', function () {
        deduplicateDoubleSlashes('//path//to//file.png')
            .should.eql('/path/to/file.png');
    });

    it('should handle empty string', function () {
        deduplicateDoubleSlashes('')
            .should.eql('');
    });
});

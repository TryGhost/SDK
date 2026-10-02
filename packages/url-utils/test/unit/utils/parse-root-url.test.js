// Switch these lines once there are useful utils
// const testUtils = require('../../utils');
require('../../utils');

const parseRootUrl = require('../../../lib/utils/parse-root-url').default;

describe('utils: parseRootUrl()', function () {
    beforeEach(function () {
        parseRootUrl.clear();
    });

    it('returns the parsed parts of a url', function () {
        const parsed = parseRootUrl('https://example.com:2368/blog/');

        parsed.href.should.equal('https://example.com:2368/blog/');
        parsed.origin.should.equal('https://example.com:2368');
        parsed.protocol.should.equal('https:');
        parsed.host.should.equal('example.com:2368');
        parsed.hostname.should.equal('example.com');
        parsed.pathname.should.equal('/blog/');
    });

    it('returns the same cached object for repeated calls', function () {
        const first = parseRootUrl('https://example.com/');
        const second = parseRootUrl('https://example.com/');

        first.should.equal(second);
    });

    it('returns an immutable result', function () {
        const parsed = parseRootUrl('https://example.com/');

        Object.isFrozen(parsed).should.be.true();
    });

    it('throws for invalid urls and does not cache them', function () {
        (() => parseRootUrl('not a url')).should.throw(TypeError);
        (() => parseRootUrl('not a url')).should.throw(TypeError);
    });

    it('evicts the least recently used entry once full', function () {
        const first = parseRootUrl('https://example.com/');

        for (let i = 0; i < 100; i++) {
            parseRootUrl(`https://example.com/${i}/`);
        }

        parseRootUrl('https://example.com/').should.not.equal(first);
    });
});

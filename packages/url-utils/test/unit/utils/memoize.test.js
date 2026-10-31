// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const sinon = require('sinon');
const memoize = require('../../../lib/utils/memoize').default;

describe('utils: memoize()', function () {
    it('returns cached results for repeated keys', function () {
        const fn = sinon.spy(key => ({key}));
        const memoized = memoize(fn);

        const first = memoized('a');
        memoized('a').should.equal(first);
        memoized('b').should.not.equal(first);
        fn.callCount.should.equal(2);
    });

    it('does not cache thrown errors', function () {
        const fn = sinon.stub().throws(new TypeError('nope'));
        const memoized = memoize(fn);

        (() => memoized('a')).should.throw(TypeError);
        (() => memoized('a')).should.throw(TypeError);
        fn.callCount.should.equal(2);
    });

    it('evicts the least recently used entry once full', function () {
        const fn = sinon.spy(key => `${key}!`);
        const memoized = memoize(fn, 2);

        memoized('a');
        memoized('b');
        memoized('a');
        memoized('c');
        fn.callCount.should.equal(3);

        memoized('a');
        fn.callCount.should.equal(3);

        memoized('b');
        fn.callCount.should.equal(4);
    });

    it('can be cleared', function () {
        const fn = sinon.spy(key => `${key}!`);
        const memoized = memoize(fn);

        memoized('a');
        memoized.clear();
        memoized('a');
        fn.callCount.should.equal(2);
    });
});

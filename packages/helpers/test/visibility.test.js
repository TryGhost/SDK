require('./utils');

const _ = require('lodash');
const visibility = require('../').utils.visibility;

describe('Visibility', function () {
    const dummyDataArr = [{
        id: 1,
        visibility: 'public'
    }, {
        id: 2,
        visibility: 'public'
    }, {
        id: 3,
        visibility: 'internal'
    }, {
        id: 4,
        visibility: 'private'
    }, {
        id: 5
    }
    ];

    const dummyDataObj = {
        a: {
            id: 1,
            visibility: 'public'
        },
        b: {
            id: 2,
            visibility: 'public'
        },
        c: {
            id: 3,
            visibility: 'internal'
        },
        d: {
            id: 4,
            visibility: 'private'
        },
        e: {
            id: 5
        }
    };

    describe('Filter', function () {
        it('defaults to an empty object, but retains the type passed in', function () {
            visibility.filter()
                .should.eql({});

            visibility.filter({})
                .should.eql({});

            visibility.filter([])
                .should.eql([]);
        });

        describe('Param: visibility', function () {
            it('should return only public items by default', function () {
                let res1 = visibility.filter(dummyDataArr);
                let res2 = visibility.filter(dummyDataObj);

                // Get just the ids for testing
                _.map(res1, 'id').should.eql([1, 2, 5]);
                _.map(res2, 'id').should.eql([1, 2, 5]);
                _.keys(res2).should.eql(['a', 'b', 'e']);
            });

            it('will return all items if visibility is "all"', function () {
                let res1 = visibility.filter(dummyDataArr, 'all');
                let res2 = visibility.filter(dummyDataObj, 'all');
                let res3 = visibility.filter(dummyDataArr, ['all']);
                let res4 = visibility.filter(dummyDataObj, ['all']);

                // Get just the ids for testing
                _.map(res1, 'id').should.eql([1, 2, 3, 4, 5]);
                _.map(res2, 'id').should.eql([1, 2, 3, 4, 5]);
                _.map(res3, 'id').should.eql([1, 2, 3, 4, 5]);
                _.map(res4, 'id').should.eql([1, 2, 3, 4, 5]);
            });

            it('will return matching items with custom visibility', function () {
                let res1 = visibility.filter(dummyDataArr, 'private');
                let res2 = visibility.filter(dummyDataObj, 'private');
                let res3 = visibility.filter(dummyDataArr, ['private']);
                let res4 = visibility.filter(dummyDataObj, ['private']);

                // Get just the ids for testing
                _.map(res1, 'id').should.eql([4]);
                _.map(res2, 'id').should.eql([4]);
                _.map(res3, 'id').should.eql([4]);
                _.map(res4, 'id').should.eql([4]);
            });

            it('will return matching items with multiple visibility settings', function () {
                let res1 = visibility.filter(dummyDataArr, 'private, internal');
                let res2 = visibility.filter(dummyDataObj, 'private, internal');
                let res3 = visibility.filter(dummyDataArr, ['private', 'internal']);
                let res4 = visibility.filter(dummyDataObj, ['private', 'internal']);

                // Get just the ids for testing
                _.map(res1, 'id').should.eql([3, 4]);
                _.map(res2, 'id').should.eql([3, 4]);
                _.map(res3, 'id').should.eql([3, 4]);
                _.map(res4, 'id').should.eql([3, 4]);
            });
        });

        describe('Param: fn', function () {
            const fn = tag => tag.id;

            it('will use a display function', function () {
                let res1 = visibility.filter(dummyDataArr, 'public', fn);
                let res2 = visibility.filter(dummyDataObj, 'public', fn);
                let res3 = visibility.filter(dummyDataArr, ['public'], fn);
                let res4 = visibility.filter(dummyDataObj, ['public'], fn);

                // Get just the ids for testing
                res1.should.eql([1, 2, 5]);
                res2.should.eql({a: 1, b: 2, e: 5});
                res3.should.eql([1, 2, 5]);
                res4.should.eql({a: 1, b: 2, e: 5});
            });

            it('will use a display function with no explicit visibility', function () {
                let res1 = visibility.filter(dummyDataArr, fn);
                let res2 = visibility.filter(dummyDataObj, fn);
                let res3 = visibility.filter(dummyDataArr, fn);
                let res4 = visibility.filter(dummyDataObj, fn);

                // Get just the ids for testing
                res1.should.eql([1, 2, 5]);
                res2.should.eql({a: 1, b: 2, e: 5});
                res3.should.eql([1, 2, 5]);
                res4.should.eql({a: 1, b: 2, e: 5});
            });

            it('will use a display function with "all" special case', function () {
                let res1 = visibility.filter(dummyDataArr, 'all', fn);
                let res2 = visibility.filter(dummyDataObj, 'all', fn);
                let res3 = visibility.filter(dummyDataArr, ['all'], fn);
                let res4 = visibility.filter(dummyDataObj, ['all'], fn);

                // Get just the ids for testing
                res1.should.eql([1, 2, 3, 4, 5]);
                res2.should.eql({a: 1, b: 2, c: 3, d: 4, e: 5});
                res3.should.eql([1, 2, 3, 4, 5]);
                res4.should.eql({a: 1, b: 2, c: 3, d: 4, e: 5});
            });
        });
    });

    describe('Parse', function () {
        it('defaults to public', function () {
            visibility.parse()
                .should.eql(['public']);
        });

        it('returns an array', function () {
            visibility.parse('test')
                .should.eql(['test']);
        });

        it('splits values correctly on comma, ignoring whitespace', function () {
            visibility.parse('test,stuff')
                .should.eql(['test', 'stuff']);

            visibility.parse('test, stuff')
                .should.eql(['test', 'stuff']);

            visibility.parse('test , stuff')
                .should.eql(['test', 'stuff']);
        });
    });
});

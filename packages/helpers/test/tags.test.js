// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('./utils');

const _ = require('lodash');
const tagsHelper = require('../').tags;

const createTag = (overrides) => {
    var newObj = _.cloneDeep(overrides);
    return _.defaults(newObj, {
        name: 'tag',
        slug: 'slug',
        visibility: 'public',
        created_by: 1,
        created_at: new Date(),
        updated_by: 1,
        updated_at: new Date()
    });
};

describe('Tags', function () {
    let tags = [];

    before(function () {
        tags.push(createTag({name: 'foo', slug: 'foo-bar'}));
        tags.push(createTag({name: '#bar', slug: 'hash-bar', visibility: 'internal'}));
        tags.push(createTag({name: 'bar', slug: 'bar'}));
        tags.push(createTag({name: 'baz', slug: 'baz'}));
        tags.push(createTag({name: 'buzz', slug: 'buzz'}));
    });

    describe('Visibility handling', function () {
        it('will only return public tags by default', function () {
            tagsHelper({tags})
                .should.eql('foo, bar, baz, buzz');
        });

        it('can return all tags with visibility "all"', function () {
            tagsHelper({tags}, {visibility: 'all'})
                .should.eql('foo, #bar, bar, baz, buzz');
        });

        it('can return only public tags with visibility "public"', function () {
            tagsHelper({tags}, {visibility: 'public'})
                .should.eql('foo, bar, baz, buzz');
        });

        it('can return only internal tags with visibility "internal"', function () {
            tagsHelper({tags}, {visibility: 'internal'})
                .should.eql('#bar');
        });
    });

    describe('Options', function () {
        it('can specify an alternative separator', function () {
            tagsHelper({tags}, {separator: ' | '})
                .should.eql('foo | bar | baz | buzz');
        });
    });
});

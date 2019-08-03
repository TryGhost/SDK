// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('./utils');

const {Tags} = require('../');

const props = {
    post: {
        id: 'Ghost__Post__5bf4406ac0ac460021423245',
        title: 'This is a Blog about Mountainbiking',
        slug: 'this-is-a-blog-about-mountainbiking',
        featured: false,
        feature_image:
            'https://s3-eu-central-1.amazonaws.com/ghost-juuro/2019/03/IMG_3219-1.jpeg',
        excerpt: 'Lorem ipsum dolor sit amet.',
        custom_excerpt: null,
        created_at_pretty: '20 November, 2018',
        published_at_pretty: '20 November, 2018',
        updated_at_pretty: '09 March, 2019',
        created_at: '2018-11-20T18:12:10.000+01:00',
        published_at: '2018-11-20T18:50:07.000+01:00',
        updated_at: '2019-03-09T21:09:50.000+01:00',
        meta_title: null,
        meta_description:
            'A short introduction for my new little blog about mountainbiking and other cycling topics.',
        og_description: null,
        og_image: null,
        og_title: null,
        twitter_description: null,
        twitter_image: null,
        twitter_title: null,
        authors: [
            {
                name: 'Juuro',
                slug: 'juuro',
                bio: null,
                profile_image:
                    '//www.gravatar.com/avatar/ecef9d9c6a9209399ff0e1d2f2ce5c71?s=250&d=mm&r=x',
                twitter: '@Juuro',
                facebook: null,
                website: null
            }
        ],
        primary_author: {
            name: 'Juuro',
            slug: 'juuro',
            bio: null,
            profile_image:
                '//www.gravatar.com/avatar/ecef9d9c6a9209399ff0e1d2f2ce5c71?s=250&d=mm&r=x',
            twitter: '@Juuro',
            facebook: null,
            website: null
        },
        primary_tag: null,
        tags: [
            {
                name: 'bike',
                slug: 'bike',
                description: null,
                feature_image: null,
                meta_description: null,
                meta_title: null,
                visibility: 'public'
            }
        ],
        plaintext: 'Post text.',
        html: '<p>Post text.</p>',
        url:
            'https://ghost-juuro.herokuapp.com/this-is-a-blog-about-mountainbiking/',
        uuid: '662fcea0-31c2-46fb-80e9-2da02dda4c74',
        page: false,
        codeinjection_foot: null,
        codeinjection_head: null,
        comment_id: '5bf4406ac0ac460021423245'
    },
    visibility: 'public',
    autolink: true,
    permalink: '/tag/:slug',
    separator: '',
    separatorClasses: 'd-none',
    from: 1,
    classes: '',
    prefixClasses: '',
    suffixClasses: '',
    linkClasses: ''
};

const result = `[{"type":"span","key":"bike","ref":null,"props":{"className":"","children":{"type":{},"key":null,"ref":null,"props":{"to":"/tag/bike","className":"","children":"bike"},"_owner":null,"_store":{}}},"_owner":null,"_store":{}}]`;

describe('Tags', function () {
    describe('Options', function () {
        it('can specify an alternative separator', function () {
            JSON.stringify(Tags(props)).should.eql(result);
        });
    });
});

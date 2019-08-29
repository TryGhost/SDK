// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('./utils');

const React = require('react');

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
            },
            {
                name: 'xc',
                slug: 'xc',
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
    from: 1,
    classes: '',
    prefixClasses: '',
    suffixClasses: '',
    linkClasses: ''
};

describe('Tags', function () {
    describe('Options', function () {
        beforeEach(function () {
            props.separator = undefined;
            props.prefix = undefined;
            props.suffix = undefined;
            props.autolink = true;
            props.permalink = '/tag/:slug';
            props.separatorClasses = undefined;
        });

        it('should use the default separator if no separator is specified', function () {
            const result = '[{"type":"span","key":"bike","ref":null,"props":{"className":"","children":{"type":{},"key":null,"ref":null,"props":{"to":"/tag/bike","className":"","children":"bike"},"_owner":null,"_store":{}}},"_owner":null,"_store":{}},{"type":"span","key":"separator_2","ref":null,"props":{},"_owner":null,"_store":{}},{"type":"span","key":"xc","ref":null,"props":{"className":"","children":{"type":{},"key":null,"ref":null,"props":{"to":"/tag/xc","className":"","children":"xc"},"_owner":null,"_store":{}}},"_owner":null,"_store":{}}]';
            
            JSON.stringify(Tags(props)).should.eql(result);
        });

        it('should use the default separator if no separator is specified and separatorClasses are specified', function () {
            props.separatorClasses = 'd-none';
            const result = '[{"type":"span","key":"bike","ref":null,"props":{"className":"","children":{"type":{},"key":null,"ref":null,"props":{"to":"/tag/bike","className":"","children":"bike"},"_owner":null,"_store":{}}},"_owner":null,"_store":{}},{"type":"span","key":"separator_2","ref":null,"props":{"className":"d-none"},"_owner":null,"_store":{}},{"type":"span","key":"xc","ref":null,"props":{"className":"","children":{"type":{},"key":null,"ref":null,"props":{"to":"/tag/xc","className":"","children":"xc"},"_owner":null,"_store":{}}},"_owner":null,"_store":{}}]';
            
            JSON.stringify(Tags(props)).should.eql(result);
        });

        it('should use the default separator if no separator is specified without autolink', function () {
            props.autolink = false;
            const result = '[{"type":"span","key":"bike","ref":null,"props":{"className":"","children":"bike"},"_owner":null,"_store":{}},{"type":"span","key":"separator_2","ref":null,"props":{},"_owner":null,"_store":{}},{"type":"span","key":"xc","ref":null,"props":{"className":"","children":"xc"},"_owner":null,"_store":{}}]';
            
            JSON.stringify(Tags(props)).should.eql(result);
        });

        it('should use the default separator if no separator is specified without a permalink', function () {
            props.permalink = '';
            const result = '[{"type":"span","key":"bike","ref":null,"props":{"className":"","children":{"type":{},"key":null,"ref":null,"props":{"to":"/bike/","className":"","children":"bike"},"_owner":null,"_store":{}}},"_owner":null,"_store":{}},{"type":"span","key":"separator_2","ref":null,"props":{},"_owner":null,"_store":{}},{"type":"span","key":"xc","ref":null,"props":{"className":"","children":{"type":{},"key":null,"ref":null,"props":{"to":"/xc/","className":"","children":"xc"},"_owner":null,"_store":{}}},"_owner":null,"_store":{}}]';
            
            JSON.stringify(Tags(props)).should.eql(result);
        });

        it('should use the default separator and a prefix and suffix', function () {
            props.prefix = 'pre';
            props.suffix = 'post';
    
            const result = '[{"type":"span","key":"prefix","ref":null,"props":{"className":"","children":"pre"},"_owner":null,"_store":{}},{"type":"span","key":"bike","ref":null,"props":{"className":"","children":{"type":{},"key":null,"ref":null,"props":{"to":"/tag/bike","className":"","children":"bike"},"_owner":null,"_store":{}}},"_owner":null,"_store":{}},{"type":"span","key":"separator_2","ref":null,"props":{},"_owner":null,"_store":{}},{"type":"span","key":"xc","ref":null,"props":{"className":"","children":{"type":{},"key":null,"ref":null,"props":{"to":"/tag/xc","className":"","children":"xc"},"_owner":null,"_store":{}}},"_owner":null,"_store":{}},{"type":"span","key":"suffix","ref":null,"props":{"className":"","children":"post"},"_owner":null,"_store":{}}]';

            JSON.stringify(Tags(props)).should.eql(result);
        });

        it('should use the default separator and a prefix react element and suffix React element', function () {
            props.prefix = React.createElement('p', {className: 'paragraph'}, 'Hello from React.');
            props.suffix = React.createElement('p', {className: 'paragraph'}, 'Hello from React.');
    
            const result = '[{"type":"p","key":null,"ref":null,"props":{"className":"paragraph","children":"Hello from React."},"_owner":null,"_store":{}},{"type":"span","key":"bike","ref":null,"props":{"className":"","children":{"type":{},"key":null,"ref":null,"props":{"to":"/tag/bike","className":"","children":"bike"},"_owner":null,"_store":{}}},"_owner":null,"_store":{}},{"type":"span","key":"separator_2","ref":null,"props":{},"_owner":null,"_store":{}},{"type":"span","key":"xc","ref":null,"props":{"className":"","children":{"type":{},"key":null,"ref":null,"props":{"to":"/tag/xc","className":"","children":"xc"},"_owner":null,"_store":{}}},"_owner":null,"_store":{}},{"type":"p","key":null,"ref":null,"props":{"className":"paragraph","children":"Hello from React."},"_owner":null,"_store":{}}]';

            JSON.stringify(Tags(props)).should.eql(result);
        });

        it('should not generate any separator if an empty string is specified', function () {
            props.separator = '';
            const result = '[{"type":"span","key":"bike","ref":null,"props":{"className":"","children":{"type":{},"key":null,"ref":null,"props":{"to":"/tag/bike","className":"","children":"bike"},"_owner":null,"_store":{}}},"_owner":null,"_store":{}},{"type":"span","key":"xc","ref":null,"props":{"className":"","children":{"type":{},"key":null,"ref":null,"props":{"to":"/tag/xc","className":"","children":"xc"},"_owner":null,"_store":{}}},"_owner":null,"_store":{}}]';
            
            JSON.stringify(Tags(props)).should.eql(result);
        });

        it('should use the specified separator', function () {
            props.separator = '🤘';
            const result = '[{"type":"span","key":"bike","ref":null,"props":{"className":"","children":{"type":{},"key":null,"ref":null,"props":{"to":"/tag/bike","className":"","children":"bike"},"_owner":null,"_store":{}}},"_owner":null,"_store":{}},{"type":"span","key":"separator_2","ref":null,"props":{"children":"🤘"},"_owner":null,"_store":{}},{"type":"span","key":"xc","ref":null,"props":{"className":"","children":{"type":{},"key":null,"ref":null,"props":{"to":"/tag/xc","className":"","children":"xc"},"_owner":null,"_store":{}}},"_owner":null,"_store":{}}]';
            
            JSON.stringify(Tags(props)).should.eql(result);
        });

        it('should use the specified react element', function () {
            props.separator = React.createElement('p', {className: 'paragraph'}, 'Hello from React.');
            const result = '[{"type":"span","key":"bike","ref":null,"props":{"className":"","children":{"type":{},"key":null,"ref":null,"props":{"to":"/tag/bike","className":"","children":"bike"},"_owner":null,"_store":{}}},"_owner":null,"_store":{}},{"key":"separator_2","ref":null,"props":{"children":{"type":"p","key":null,"ref":null,"props":{"className":"paragraph","children":"Hello from React."},"_owner":null,"_store":{}}},"_owner":null,"_store":{}},{"type":"span","key":"xc","ref":null,"props":{"className":"","children":{"type":{},"key":null,"ref":null,"props":{"to":"/tag/xc","className":"","children":"xc"},"_owner":null,"_store":{}}},"_owner":null,"_store":{}}]';

            JSON.stringify(Tags(props)).should.eql(result);
        });
    });
});

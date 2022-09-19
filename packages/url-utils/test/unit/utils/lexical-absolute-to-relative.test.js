// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const lexicalAbsoluteToRelative = require('../../../lib/utils/lexical-absolute-to-relative');

describe('utils: lexicalAbsoluteToRelative()', function () {
    const siteUrl = 'http://my-ghost-blog.com';
    let options;

    beforeEach(function () {
        options = {
            staticImageUrlPrefix: 'content/images'
        };
    });

    it('handles blank lexical', function () {
        lexicalAbsoluteToRelative('', siteUrl, options).should.equal('');
    });

    it('handles null lexical', function () {
        should.equal(lexicalAbsoluteToRelative(null, siteUrl, options), null);
    });

    it('converts absolute URLs in markup links', function () {
        const lexical = JSON.stringify({
            root: {
                children: [
                    {
                        children: [
                            {
                                detail: 0,
                                format: 0,
                                mode: 'normal',
                                style: '',
                                text: 'Links can be ',
                                type: 'text',
                                version: 1
                            },
                            {
                                children: [
                                    {
                                        detail: 0,
                                        format: 0,
                                        mode: 'normal',
                                        style: '',
                                        text: 'inline',
                                        type: 'text',
                                        version: 1
                                    }
                                ],
                                direction: 'ltr',
                                format: '',
                                indent: 0,
                                type: 'link',
                                version: 1,
                                rel: null,
                                target: null,
                                url: 'http://my-ghost-blog.com/inline'
                            },
                            {
                                detail: 0,
                                format: 0,
                                mode: 'normal',
                                style: '',
                                text: ' and ',
                                type: 'text',
                                version: 1
                            },
                            {
                                children: [
                                    {
                                        detail: 0,
                                        format: 1,
                                        mode: 'normal',
                                        style: '',
                                        text: 'formatted',
                                        type: 'text',
                                        version: 1
                                    }
                                ],
                                direction: 'ltr',
                                format: '',
                                indent: 0,
                                type: 'link',
                                version: 1,
                                rel: null,
                                target: null,
                                url: 'http://my-ghost-blog.com/formatted'
                            },
                            {
                                detail: 0,
                                format: 1,
                                mode: 'normal',
                                style: '',
                                text: '.',
                                type: 'text',
                                version: 1
                            }
                        ],
                        direction: 'ltr',
                        format: '',
                        indent: 0,
                        type: 'paragraph',
                        version: 1
                    },
                    {
                        children: [
                            {
                                children: [
                                    {
                                        children: [
                                            {
                                                detail: 0,
                                                format: 0,
                                                mode: 'normal',
                                                style: '',
                                                text: 'in lists',
                                                type: 'text',
                                                version: 1
                                            }
                                        ],
                                        direction: 'ltr',
                                        format: '',
                                        indent: 0,
                                        type: 'link',
                                        version: 1,
                                        rel: null,
                                        target: null,
                                        url: 'http://my-ghost-blog.com/in-lists'
                                    }
                                ],
                                direction: 'ltr',
                                format: '',
                                indent: 0,
                                type: 'listitem',
                                version: 1,
                                value: 1
                            },
                            {
                                children: [
                                    {
                                        children: [
                                            {
                                                children: [
                                                    {
                                                        detail: 0,
                                                        format: 0,
                                                        mode: 'normal',
                                                        style: '',
                                                        text: 'and ',
                                                        type: 'text',
                                                        version: 1
                                                    },
                                                    {
                                                        children: [
                                                            {
                                                                detail: 0,
                                                                format: 0,
                                                                mode: 'normal',
                                                                style: '',
                                                                text: 'nested lists',
                                                                type: 'text',
                                                                version: 1
                                                            }
                                                        ],
                                                        direction: 'ltr',
                                                        format: '',
                                                        indent: 0,
                                                        type: 'link',
                                                        version: 1,
                                                        rel: null,
                                                        target: null,
                                                        url: 'http://my-ghost-blog.com/in-nested-list'
                                                    }
                                                ],
                                                direction: 'ltr',
                                                format: '',
                                                indent: 1,
                                                type: 'listitem',
                                                version: 1,
                                                value: 1
                                            }
                                        ],
                                        direction: 'ltr',
                                        format: '',
                                        indent: 0,
                                        type: 'list',
                                        version: 1,
                                        listType: 'bullet',
                                        start: 1,
                                        tag: 'ul'
                                    }
                                ],
                                direction: 'ltr',
                                format: '',
                                indent: 0,
                                type: 'listitem',
                                version: 1,
                                value: 2
                            }
                        ],
                        direction: 'ltr',
                        format: '',
                        indent: 0,
                        type: 'list',
                        version: 1,
                        listType: 'bullet',
                        start: 1,
                        tag: 'ul'
                    },
                    {
                        children: [
                            {
                                children: [
                                    {
                                        detail: 0,
                                        format: 0,
                                        mode: 'normal',
                                        style: '',
                                        text: 'homepage',
                                        type: 'text',
                                        version: 1
                                    }
                                ],
                                direction: 'ltr',
                                format: '',
                                indent: 0,
                                type: 'link',
                                version: 1,
                                rel: null,
                                target: null,
                                url: 'http://my-ghost-blog.com/'
                            }
                        ],
                        direction: null,
                        format: '',
                        indent: 0,
                        type: 'paragraph',
                        version: 1
                    },
                    {
                        children: [
                            {
                                children: [
                                    {
                                        detail: 0,
                                        format: 0,
                                        mode: 'normal',
                                        style: '',
                                        text: 'external',
                                        type: 'text',
                                        version: 1
                                    }
                                ],
                                direction: 'ltr',
                                format: '',
                                indent: 0,
                                type: 'link',
                                version: 1,
                                rel: null,
                                target: null,
                                url: 'https://example.com/external'
                            }
                        ],
                        direction: 'ltr',
                        format: '',
                        indent: 0,
                        type: 'paragraph',
                        version: 1
                    },
                    {
                        children: [
                            {
                                children: [
                                    {
                                        detail: 0,
                                        format: 0,
                                        mode: 'normal',
                                        style: '',
                                        text: 'content links',
                                        type: 'text',
                                        version: 1
                                    }
                                ],
                                direction: 'ltr',
                                format: '',
                                indent: 0,
                                type: 'link',
                                version: 1,
                                rel: null,
                                target: null,
                                url: 'http://my-ghost-blog.com/content/images/example.jpg'
                            }
                        ],
                        direction: 'ltr',
                        format: '',
                        indent: 0,
                        type: 'paragraph',
                        version: 1
                    }
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'root',
                version: 1
            }
        });

        const serializedResult = lexicalAbsoluteToRelative(lexical, siteUrl, options);
        const result = JSON.parse(serializedResult);

        result.root.children[0].children[1].url.should.equal('/inline');
        result.root.children[0].children[3].url.should.equal('/formatted');
        result.root.children[1].children[0].children[0].url.should.equal('/in-lists');
        result.root.children[1].children[1].children[0].children[0].children[1].url.should.equal('/in-nested-list');
        result.root.children[2].children[0].url.should.equal('/');
        result.root.children[3].children[0].url.should.equal('https://example.com/external');
        result.root.children[4].children[0].url.should.equal('/content/images/example.jpg');
    });

    it('handles invalid urls', function () {
        // not a valid lexical doc but useful for brevity as the relevant code paths will still be hit
        const lexical = JSON.stringify({
            root: {
                children: [
                    {url: 'http://i%20don’t%20believe%20that%20our%20platform%20should%20take%20that%20down%20because%20i%20think%20there%20are%20things%20that%20different%20people%20get%20wrong'},
                    {url: 'i%20don’t%20believe%20that%20our%20platform%20should%20take%20that%20down%20because%20i%20think%20there%20are%20things%20that%20different%20people%20get%20wrong'},
                    {url: 'http://my-ghost-blog.com/sanity-check'}
                ]
            }
        });

        const serializedResult = lexicalAbsoluteToRelative(lexical, siteUrl, options);
        const result = JSON.parse(serializedResult);

        result.root.children[0].url.should.equal('http://i%20don’t%20believe%20that%20our%20platform%20should%20take%20that%20down%20because%20i%20think%20there%20are%20things%20that%20different%20people%20get%20wrong');
        result.root.children[1].url.should.equal('i%20don’t%20believe%20that%20our%20platform%20should%20take%20that%20down%20because%20i%20think%20there%20are%20things%20that%20different%20people%20get%20wrong');
        result.root.children[2].url.should.equal('/sanity-check');
    });
});

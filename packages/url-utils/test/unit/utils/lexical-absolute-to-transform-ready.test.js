// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const UrlUtils = require('../../../cjs/UrlUtils');
const lexicalAbsoluteToTransformReady = require('../../../cjs/utils/lexical-absolute-to-transform-ready');

describe('utils: lexicalAbsoluteToTransformReady()', function () {
    const siteUrl = 'http://my-ghost-blog.com';
    let options;

    beforeEach(function () {
        options = {
            staticImageUrlPrefix: 'content/images'
        };
    });

    it('handles blank lexical', function () {
        lexicalAbsoluteToTransformReady('', siteUrl, options).should.equal('');
    });

    it('handles null lexical', function () {
        should.equal(lexicalAbsoluteToTransformReady(null, siteUrl, options), null);
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

        const serializedResult = lexicalAbsoluteToTransformReady(lexical, siteUrl, options);
        const result = JSON.parse(serializedResult);

        result.root.children[0].children[1].url.should.equal('__GHOST_URL__/inline');
        result.root.children[0].children[3].url.should.equal('__GHOST_URL__/formatted');
        result.root.children[1].children[0].children[0].url.should.equal('__GHOST_URL__/in-lists');
        result.root.children[1].children[1].children[0].children[0].children[1].url.should.equal('__GHOST_URL__/in-nested-list');
        result.root.children[2].children[0].url.should.equal('__GHOST_URL__/');
        result.root.children[3].children[0].url.should.equal('https://example.com/external');
        result.root.children[4].children[0].url.should.equal('__GHOST_URL__/content/images/example.jpg');
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

        const serializedResult = lexicalAbsoluteToTransformReady(lexical, siteUrl, options);
        const result = JSON.parse(serializedResult);

        result.root.children[0].url.should.equal('http://i%20don’t%20believe%20that%20our%20platform%20should%20take%20that%20down%20because%20i%20think%20there%20are%20things%20that%20different%20people%20get%20wrong');
        result.root.children[1].url.should.equal('i%20don’t%20believe%20that%20our%20platform%20should%20take%20that%20down%20because%20i%20think%20there%20are%20things%20that%20different%20people%20get%20wrong');
        result.root.children[2].url.should.equal('__GHOST_URL__/sanity-check');
    });

    it('handles cards', function () {
        const urlUtils = new UrlUtils({
            getSubdir: function () {
                return '';
            },
            getSiteUrl: function () {
                return siteUrl;
            }
        });

        Object.assign(options, {
            nodes: [
                class ImageNode {
                    static getType() {
                        return 'image';
                    }

                    static get urlTransformMap() {
                        return {
                            src: 'url',
                            caption: 'html'
                        };
                    }
                }
            ],
            transformMap: {
                toTransformReady: {
                    url: urlUtils.toTransformReady.bind(urlUtils),
                    html: urlUtils.htmlToTransformReady.bind(urlUtils)
                }
            }
        });

        const lexical = JSON.stringify({
            root: {
                children: [
                    {type: 'image', src: 'http://my-ghost-blog.com/image.png', caption: 'Captions are HTML with only <a href="http://my-ghost-blog.com/image-caption-link">links transformed</a> - this is a plaintext url: http://my-ghost-blog.com/plaintext-url'}
                ]
            }
        });

        const serializedResult = lexicalAbsoluteToTransformReady(lexical, siteUrl, options);
        const result = JSON.parse(serializedResult);

        result.root.children[0].src.should.equal('__GHOST_URL__/image.png');
        result.root.children[0].caption.should.equal('Captions are HTML with only <a href="__GHOST_URL__/image-caption-link">links transformed</a> - this is a plaintext url: http://my-ghost-blog.com/plaintext-url');
    });

    it('handles cards with array properties', function () {
        const urlUtils = new UrlUtils({
            getSubdir: function () {
                return '';
            },
            getSiteUrl: function () {
                return siteUrl;
            }
        });

        Object.assign(options, {
            nodes: [
                class GalleryNode {
                    static getType() {
                        return 'gallery';
                    }

                    static get urlTransformMap() {
                        return {
                            images: {src: 'url'}
                        };
                    }
                }
            ],
            transformMap: {
                toTransformReady: {
                    url: urlUtils.toTransformReady.bind(urlUtils),
                    html: urlUtils.htmlToTransformReady.bind(urlUtils)
                }
            }
        });

        const lexical = JSON.stringify({
            root: {
                children: [{
                    type: 'gallery',
                    images: [
                        {src: 'http://my-ghost-blog.com/image1.png'},
                        {src: 'http://my-ghost-blog.com/image2.png'}
                    ]
                }]
            }
        });

        const serializedResult = lexicalAbsoluteToTransformReady(lexical, siteUrl, options);
        const result = JSON.parse(serializedResult);

        result.root.children[0].images[0].src.should.equal('__GHOST_URL__/image1.png');
        result.root.children[0].images[1].src.should.equal('__GHOST_URL__/image2.png');
    });

    it('handles cards with deeply nested properties', function () {
        const urlUtils = new UrlUtils({
            getSubdir: function () {
                return '';
            },
            getSiteUrl: function () {
                return siteUrl;
            }
        });

        Object.assign(options, {
            nodes: [
                class TestNode {
                    static getType() {
                        return 'test';
                    }

                    static get urlTransformMap() {
                        return {
                            'meta.image.src': 'url'
                        };
                    }
                }
            ],
            transformMap: {
                toTransformReady: {
                    url: urlUtils.toTransformReady.bind(urlUtils),
                    html: urlUtils.htmlToTransformReady.bind(urlUtils)
                }
            }
        });

        const lexical = JSON.stringify({
            root: {
                children: [{
                    type: 'test',
                    meta: {
                        image: {
                            src: 'http://my-ghost-blog.com/image.png'
                        }
                    }
                }]
            }
        });

        const serializedResult = lexicalAbsoluteToTransformReady(lexical, siteUrl, options);
        const result = JSON.parse(serializedResult);

        result.root.children[0].meta.image.src.should.equal('__GHOST_URL__/image.png');
    });

    it('handles cards with arrays of deeply nested properties', function () {
        const urlUtils = new UrlUtils({
            getSubdir: function () {
                return '';
            },
            getSiteUrl: function () {
                return siteUrl;
            }
        });

        Object.assign(options, {
            nodes: [
                class GalleryNode {
                    static getType() {
                        return 'gallery';
                    }

                    static get urlTransformMap() {
                        return {
                            images: {
                                'srcs.main': 'url'
                            }
                        };
                    }
                }
            ],
            transformMap: {
                toTransformReady: {
                    url: urlUtils.toTransformReady.bind(urlUtils),
                    html: urlUtils.htmlToTransformReady.bind(urlUtils)
                }
            }
        });

        const lexical = JSON.stringify({
            root: {
                children: [{
                    type: 'gallery',
                    images: [
                        {srcs: {main: 'http://my-ghost-blog.com/image1.png'}},
                        {srcs: {main: 'http://my-ghost-blog.com/image2.png'}}
                    ]
                }]
            }
        });

        const serializedResult = lexicalAbsoluteToTransformReady(lexical, siteUrl, options);
        const result = JSON.parse(serializedResult);

        result.root.children[0].images[0].srcs.main.should.equal('__GHOST_URL__/image1.png');
        result.root.children[0].images[1].srcs.main.should.equal('__GHOST_URL__/image2.png');
    });

    it('handles cards with arrays of arrays', function () {
        const urlUtils = new UrlUtils({
            getSubdir: function () {
                return '';
            },
            getSiteUrl: function () {
                return siteUrl;
            }
        });

        Object.assign(options, {
            nodes: [
                class GalleryNode {
                    static getType() {
                        return 'gallery';
                    }

                    static get urlTransformMap() {
                        return {
                            images: {
                                sizes: {
                                    src: 'url'
                                }
                            }
                        };
                    }
                }
            ],
            transformMap: {
                toTransformReady: {
                    url: urlUtils.toTransformReady.bind(urlUtils),
                    html: urlUtils.htmlToTransformReady.bind(urlUtils)
                }
            }
        });

        const lexical = JSON.stringify({
            root: {
                children: [{
                    type: 'gallery',
                    images: [
                        {
                            sizes: [
                                {src: 'http://my-ghost-blog.com/image1.png'},
                                {src: 'http://my-ghost-blog.com/image2.png'}
                            ]
                        },
                        {
                            sizes: [
                                {src: 'http://my-ghost-blog.com/image3.png'},
                                {src: 'http://my-ghost-blog.com/image4.png'}
                            ]
                        }
                    ]
                }]
            }
        });

        const serializedResult = lexicalAbsoluteToTransformReady(lexical, siteUrl, options);
        const result = JSON.parse(serializedResult);

        result.root.children[0].images[0].sizes[0].src.should.equal('__GHOST_URL__/image1.png');
        result.root.children[0].images[0].sizes[1].src.should.equal('__GHOST_URL__/image2.png');
        result.root.children[0].images[1].sizes[0].src.should.equal('__GHOST_URL__/image3.png');
        result.root.children[0].images[1].sizes[1].src.should.equal('__GHOST_URL__/image4.png');
    });

    it('does not transform unknown cards', function () {
        const urlUtils = new UrlUtils({
            getSubdir: function () {
                return '';
            },
            getSiteUrl: function () {
                return siteUrl;
            }
        });

        Object.assign(options, {
            nodes: [],
            transformMap: {
                toTransformReady: {
                    url: urlUtils.toTransformReady.bind(urlUtils),
                    html: urlUtils.htmlToTransformReady.bind(urlUtils)
                }
            }
        });

        const lexical = JSON.stringify({
            root: {
                children: [
                    {type: 'image', src: 'http://my-ghost-blog.com/image.png', caption: 'Captions are HTML with only <a href="http://my-ghost-blog.com/image-caption-link">links transformed</a> - this is a plaintext url: http://my-ghost-blog.com/plaintext-url'}
                ]
            }
        });

        const serializedResult = lexicalAbsoluteToTransformReady(lexical, siteUrl, options);
        const result = JSON.parse(serializedResult);

        result.root.children[0].src.should.equal('http://my-ghost-blog.com/image.png');
        result.root.children[0].caption.should.equal('Captions are HTML with only <a href="http://my-ghost-blog.com/image-caption-link">links transformed</a> - this is a plaintext url: http://my-ghost-blog.com/plaintext-url');
    });

    it('does not transform unknown card properties', function () {
        const urlUtils = new UrlUtils({
            getSubdir: function () {
                return '';
            },
            getSiteUrl: function () {
                return siteUrl;
            }
        });

        Object.assign(options, {
            nodes: [
                class ImageNode {
                    static getType() {
                        return 'image';
                    }

                    static get urlTransformMap() {
                        return {
                            src: 'url',
                            caption: 'html'
                        };
                    }
                }
            ],
            transformMap: {
                toTransformReady: {
                    url: urlUtils.toTransformReady.bind(urlUtils),
                    html: urlUtils.htmlToTransformReady.bind(urlUtils)
                }
            }
        });

        const lexical = JSON.stringify({
            root: {
                children: [
                    {type: 'image', src: 'http://my-ghost-blog.com/image.png', other: 'http://my-ghost-blog.com/unknown-card-property'}
                ]
            }
        });

        const serializedResult = lexicalAbsoluteToTransformReady(lexical, siteUrl, options);
        const result = JSON.parse(serializedResult);

        result.root.children[0].src.should.equal('__GHOST_URL__/image.png');
        result.root.children[0].other.should.equal('http://my-ghost-blog.com/unknown-card-property');
    });
});

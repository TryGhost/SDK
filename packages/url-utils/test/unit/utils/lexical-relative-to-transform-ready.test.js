// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const UrlUtils = require('../../../lib/url-utils');
const lexicalRelativeToTransformReady = require('../../../lib/utils/lexical-relative-to-transform-ready');

describe('utils: lexicalRelativeToTransformReady()', function () {
    const siteUrl = 'http://my-ghost-blog.com';
    const itemPath = '/my-awesome-post';
    let options;

    beforeEach(function () {
        options = {
            staticImageUrlPrefix: 'content/images'
        };
    });

    it('handles blank lexical', function () {
        lexicalRelativeToTransformReady('', siteUrl, options).should.equal('');
    });

    it('handles null lexical', function () {
        should.equal(lexicalRelativeToTransformReady(null, siteUrl, options), null);
    });

    it('converts relative URLs in markup links', function () {
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
                                url: '/inline'
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
                                url: '/formatted'
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
                                        url: '/in-lists'
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
                                                        url: '/in-nested-list'
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
                                url: '/'
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
                                url: '/content/images/example.jpg'
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

        const serializedResult = lexicalRelativeToTransformReady(lexical, siteUrl, itemPath, options);
        const result = JSON.parse(serializedResult);

        result.root.children[0].children[1].url.should.equal('__GHOST_URL__/inline');
        result.root.children[0].children[3].url.should.equal('__GHOST_URL__/formatted');
        result.root.children[1].children[0].children[0].url.should.equal('__GHOST_URL__/in-lists');
        result.root.children[1].children[1].children[0].children[0].children[1].url.should.equal('__GHOST_URL__/in-nested-list');
        result.root.children[2].children[0].url.should.equal('__GHOST_URL__/');
        result.root.children[3].children[0].url.should.equal('https://example.com/external');
        result.root.children[4].children[0].url.should.equal('__GHOST_URL__/content/images/example.jpg');
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
                    {type: 'image', src: '/image.png', caption: 'Captions are HTML with only <a href="/image-caption-link">links transformed</a> - this is a plaintext url: /plaintext-url'}
                ]
            }
        });

        const serializedResult = lexicalRelativeToTransformReady(lexical, siteUrl, itemPath, options);
        const result = JSON.parse(serializedResult);

        result.root.children[0].src.should.equal('__GHOST_URL__/image.png');
        result.root.children[0].caption.should.equal('Captions are HTML with only <a href="__GHOST_URL__/image-caption-link">links transformed</a> - this is a plaintext url: /plaintext-url');
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
                    {type: 'image', src: '/image.png', caption: 'Captions are HTML with only <a href="/image-caption-link">links transformed</a> - this is a plaintext url: /plaintext-url'}
                ]
            }
        });

        const serializedResult = lexicalRelativeToTransformReady(lexical, siteUrl, itemPath, options);
        const result = JSON.parse(serializedResult);

        result.root.children[0].src.should.equal('/image.png');
        result.root.children[0].caption.should.equal('Captions are HTML with only <a href="/image-caption-link">links transformed</a> - this is a plaintext url: /plaintext-url');
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
                    {type: 'image', src: '/image.png', other: '/unknown-card-property'}
                ]
            }
        });

        const serializedResult = lexicalRelativeToTransformReady(lexical, siteUrl, itemPath, options);
        const result = JSON.parse(serializedResult);

        result.root.children[0].src.should.equal('__GHOST_URL__/image.png');
        result.root.children[0].other.should.equal('/unknown-card-property');
    });
});

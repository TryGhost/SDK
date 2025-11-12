require('../../utils');

const lexicalToTransformReady = require('../../../cjs/utils/lexical-to-transform-ready');

describe('utils: lexicalToTransformReady()', function () {
    const siteUrl = 'http://my-ghost-blog.com';
    const itemPath = '/my-awesome-post';
    let options;

    beforeEach(function () {
        options = {
            staticImageUrlPrefix: 'content/images'
        };
    });

    it('converts relative lexical to transform-ready', function () {
        const lexical = JSON.stringify({
            root: {
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
                                        text: 'Test',
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
                                url: '/test'
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

        const result = lexicalToTransformReady(lexical, siteUrl, itemPath, options);
        const parsed = JSON.parse(result);

        parsed.root.children[0].children[0].url.should.equal('__GHOST_URL__/test');
    });

    it('handles options when itemPath is an object', function () {
        const lexical = JSON.stringify({
            root: {
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
                                        text: 'Test',
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
                                url: '/test'
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

        const optionsAsItemPath = {
            staticImageUrlPrefix: 'content/images'
        };
        const result = lexicalToTransformReady(lexical, siteUrl, optionsAsItemPath);
        const parsed = JSON.parse(result);

        parsed.root.children[0].children[0].url.should.equal('__GHOST_URL__/test');
    });

    it('handles options when itemPath is an object and options is null', function () {
        const lexical = JSON.stringify({
            root: {
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
                                        text: 'Test',
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
                                url: '/test'
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

        const optionsAsItemPath = {
            staticImageUrlPrefix: 'content/images'
        };
        const result = lexicalToTransformReady(lexical, siteUrl, optionsAsItemPath, null);
        const parsed = JSON.parse(result);

        parsed.root.children[0].children[0].url.should.equal('__GHOST_URL__/test');
    });

    it('handles empty lexical', function () {
        const lexical = JSON.stringify({
            root: {
                children: [],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'root',
                version: 1
            }
        });

        const result = lexicalToTransformReady(lexical, siteUrl, itemPath, options);
        const parsed = JSON.parse(result);

        parsed.root.children.should.be.an.Array();
        parsed.root.children.length.should.equal(0);
    });
});


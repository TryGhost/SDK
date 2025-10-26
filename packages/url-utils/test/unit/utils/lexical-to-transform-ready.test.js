// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const lexicalToTransformReady = require('../../../lib/utils/lexical-to-transform-ready');

describe('utils: lexicalToTransformReady()', function () {
    const siteUrl = 'https://my-blog.com';
    const mediaCdn = 'https://media-cdn.ghost.io/site-uuid';
    const filesCdn = 'https://files-cdn.ghost.io/site-uuid';
    let options;

    beforeEach(function () {
        options = {
            staticImageUrlPrefix: 'content/images',
            staticFilesUrlPrefix: 'content/files',
            staticMediaUrlPrefix: 'content/media',
            mediaBaseUrl: mediaCdn,
            filesBaseUrl: filesCdn
        };
    });

    it('converts media CDN URLs in links to transform-ready format', function () {
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
                                        text: 'Media asset',
                                        type: 'text',
                                        version: 1
                                    }
                                ],
                                direction: 'ltr',
                                format: '',
                                indent: 0,
                                rel: null,
                                target: null,
                                type: 'link',
                                url: `${mediaCdn}/content/media/2025/01/video.mp4`,
                                version: 1
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

        const serializedResult = lexicalToTransformReady(lexical, siteUrl, options);
        const result = JSON.parse(serializedResult);

        result.root.children[0].children[0].url.should.equal('__GHOST_URL__/content/media/2025/01/video.mp4');
    });

    it('converts files CDN URLs in links to transform-ready format', function () {
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
                                        text: 'Files asset',
                                        type: 'text',
                                        version: 1
                                    }
                                ],
                                direction: 'ltr',
                                format: '',
                                indent: 0,
                                rel: null,
                                target: null,
                                type: 'link',
                                url: `${filesCdn}/content/files/2025/01/document.pdf`,
                                version: 1
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

        const serializedResult = lexicalToTransformReady(lexical, siteUrl, options);
        const result = JSON.parse(serializedResult);

        result.root.children[0].children[0].url.should.equal('__GHOST_URL__/content/files/2025/01/document.pdf');
    });
});

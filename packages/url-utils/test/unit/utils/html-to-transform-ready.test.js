// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const htmlToTransformReady = require('../../../lib/utils/html-to-transform-ready');

describe('utils: htmlToTransformReady()', function () {
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

    it('converts media CDN URLs to transform-ready format', function () {
        const html = `<div class="kg-card kg-media-card"><video src="${mediaCdn}/content/media/2025/10/video.mp4"></video></div>`;

        const result = htmlToTransformReady(html, siteUrl, options);

        result.should.equal('<div class="kg-card kg-media-card"><video src="__GHOST_URL__/content/media/2025/10/video.mp4"></video></div>');
    });

    it('converts files CDN URLs to transform-ready format', function () {
        const html = `<div class="kg-card kg-file-card"><a href="${filesCdn}/content/files/2025/10/martin-1.jpg">Download</a></div>`;

        const result = htmlToTransformReady(html, siteUrl, options);

        result.should.equal('<div class="kg-card kg-file-card"><a href="__GHOST_URL__/content/files/2025/10/martin-1.jpg">Download</a></div>');
    });
});

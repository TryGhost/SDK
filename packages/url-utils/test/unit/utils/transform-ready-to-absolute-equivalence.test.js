// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const UrlUtils = require('../../../lib/UrlUtils').default;
const transformReadyToAbsolute = require('../../../lib/utils/transform-ready-to-absolute').default;
const legacy = require('../../utils/legacy/transform-ready-to-absolute');

const inputs = [
    undefined,
    null,
    '',
    'no placeholder here',
    'https://example.com/content/images/a.jpg',
    '__GHOST_URL__',
    '__GHOST_URL__/',
    '__GHOST_URL__/my-post/',
    '__GHOST_URL__/content/images/a.jpg',
    '__GHOST_URL__/content/images',
    '__GHOST_URL__content/images/a.jpg',
    '__GHOST_URL__/content/imagesX/a.jpg',
    '__GHOST_URL__/content/image/a.jpg',
    '__GHOST_URL__/content/files/doc.pdf',
    '__GHOST_URL__/content/filesX/doc.pdf',
    '__GHOST_URL__/content/media/video.mp4',
    '__GHOST_URL__/content/mediaX/video.mp4',
    '__GHOST_URL__/cdn/a.jpg',
    '__GHOST_URL__/custom/images/a.jpg',
    '<a href="__GHOST_URL__/post/"><img src="__GHOST_URL__/content/images/b.png"></a>',
    '__GHOST_URL__/content/media/v.mp4 __GHOST_URL__/content/files/f.pdf __GHOST_URL__/content/images/i.png __GHOST_URL__/',
    '__GHOST_URL____GHOST_URL__/content/images/z.png',
    '__GHOST_URL___GHOST_URL__/content/images/z.png',
    'text __GHOST_URL__',
    '__CUSTOM__/content/images/a.jpg and __GHOST_URL__/content/images/a.jpg',
    'emoji 😀__GHOST_URL__/😀'
];

const roots = [
    'https://example.com',
    'https://example.com/',
    'https://example.com/subdir/',
    'https://example.com//'
];

const assetBaseUrlVariants = [
    {},
    {image: 'https://images.cdn.com/'},
    {image: 'https://images.cdn.com', files: 'https://files.cdn.com/', media: 'https://media.cdn.com/subdir/'},
    {files: 'https://files.cdn.com'},
    {media: 'https://media.cdn.com'}
];

const callOptionVariants = [
    undefined,
    {},
    {replacementStr: undefined},
    {replacementStr: '__CUSTOM__'},
    {staticImageUrlPrefix: 'custom/images'},
    {imageBaseUrl: 'https://override.cdn.com/'},
    {imageBaseUrl: null},
    {filesBaseUrl: 'https://override-files.cdn.com', mediaBaseUrl: 'https://override-media.cdn.com/'},
    {staticImageUrlPrefix: 'content/images', staticFilesUrlPrefix: 'content/files', staticMediaUrlPrefix: 'content/media'},
    {staticImageUrlPrefix: ''}
];

function assetOptionsFor(assetBaseUrls) {
    return {
        imageBaseUrl: assetBaseUrls.image || null,
        filesBaseUrl: assetBaseUrls.files || null,
        mediaBaseUrl: assetBaseUrls.media || null
    };
}

describe('utils: transformReadyToAbsolute() equivalence with 5.3.0', function () {
    it('produces identical output for all inputs and options', function () {
        let checked = 0;

        for (const root of roots) {
            for (const assetBaseUrls of assetBaseUrlVariants) {
                for (const callOptions of callOptionVariants) {
                    const options = callOptions === undefined && Object.keys(assetBaseUrls).length === 0
                        ? undefined
                        : Object.assign({}, assetOptionsFor(assetBaseUrls), callOptions);

                    for (const input of inputs) {
                        const expected = legacy.transformReadyToAbsolute(input, root, options);
                        const actual = transformReadyToAbsolute(input, root, options);
                        (actual === expected).should.equal(true, `input: ${input}, root: ${root}, options: ${JSON.stringify(options)}\nexpected: ${expected}\nactual: ${actual}`);
                        checked += 1;
                    }
                }
            }
        }

        checked.should.be.above(0);
    });

    it('produces identical output for an empty replacementStr', function () {
        for (const input of ['abc', '😀/content/images/x', '/content/images/a.jpg']) {
            const options = {replacementStr: '', imageBaseUrl: 'https://cdn.com/'};
            transformReadyToAbsolute(input, 'https://example.com/', options)
                .should.equal(legacy.transformReadyToAbsolute(input, 'https://example.com/', options));
        }
    });

    it('keeps working after the base url cache is cleared', function () {
        for (let i = 0; i < 101; i++) {
            transformReadyToAbsolute('__GHOST_URL__/a/', `https://example${i}.com/`)
                .should.equal(`https://example${i}.com/a/`);
        }
    });

    it('produces identical output when options are null', function () {
        transformReadyToAbsolute('__GHOST_URL__/a/', 'https://example.com/', null)
            .should.equal(legacy.transformReadyToAbsolute('__GHOST_URL__/a/', 'https://example.com/', null));
    });
});

describe('UrlUtils: transformReadyToAbsolute() equivalence with 5.3.0', function () {
    it('produces identical output for all inputs and options', function () {
        for (const siteUrl of roots) {
            for (const assetBaseUrls of assetBaseUrlVariants) {
                for (const frozen of [false, true]) {
                    const urlUtils = new UrlUtils({getSiteUrl: () => siteUrl, assetBaseUrls, frozen});
                    const config = {siteUrl, assetBaseUrls};

                    for (const callOptions of callOptionVariants) {
                        for (const input of inputs) {
                            const expected = legacy.urlUtilsTransformReadyToAbsolute(config, input, callOptions);
                            const actual = urlUtils.transformReadyToAbsolute(input, callOptions);
                            (actual === expected).should.equal(true, `input: ${input}, site: ${siteUrl}, assets: ${JSON.stringify(assetBaseUrls)}, options: ${JSON.stringify(callOptions)}\nexpected: ${expected}\nactual: ${actual}`);
                        }
                    }
                }
            }
        }
    });

    it('produces identical output with custom static prefixes', function () {
        const config = {
            siteUrl: 'https://example.com/',
            staticImageUrlPrefix: 'assets/img',
            staticFilesUrlPrefix: 'assets/files',
            staticMediaUrlPrefix: 'assets/media',
            assetBaseUrls: {image: 'https://img.cdn/', files: 'https://files.cdn/', media: 'https://media.cdn/'}
        };
        const urlUtils = new UrlUtils(Object.assign({getSiteUrl: () => config.siteUrl}, config));

        for (const input of inputs) {
            for (const callOptions of callOptionVariants) {
                const expected = legacy.urlUtilsTransformReadyToAbsolute(config, input, callOptions);
                (urlUtils.transformReadyToAbsolute(input, callOptions) === expected).should.equal(true);
            }
        }

        urlUtils.transformReadyToAbsolute('__GHOST_URL__/assets/img/a.png').should.equal('https://img.cdn/assets/img/a.png');
    });

    it('does not look up the site url when there is nothing to replace', function () {
        let calls = 0;
        const urlUtils = new UrlUtils({getSiteUrl: () => {
            calls += 1;
            return 'https://example.com/';
        }});

        urlUtils.transformReadyToAbsolute('https://example.com/a/').should.equal('https://example.com/a/');
        calls.should.equal(0);

        urlUtils.transformReadyToAbsolute('__GHOST_URL__/a/').should.equal('https://example.com/a/');
        calls.should.equal(1);
    });
});

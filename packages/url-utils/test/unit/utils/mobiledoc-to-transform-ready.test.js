require('../../utils');

const mobiledocToTransformReady = require('../../../lib/utils/mobiledoc-to-transform-ready');

describe('utils: mobiledocToTransformReady()', function () {
    const siteUrl = 'http://my-ghost-blog.com';
    const itemPath = '/my-awesome-post';
    let options;

    beforeEach(function () {
        options = {
            staticImageUrlPrefix: 'content/images'
        };
    });

    it('converts relative mobiledoc to transform-ready', function () {
        const mobiledoc = {
            version: '0.3.1',
            atoms: [],
            cards: [],
            markups: [
                ['a', ['href', '/test']]
            ],
            sections: [
                [1, 'p', [
                    [0, [0], 1, 'Test']
                ]]
            ]
        };
        const serializedMobiledoc = JSON.stringify(mobiledoc);

        const result = mobiledocToTransformReady(serializedMobiledoc, siteUrl, itemPath, options);
        const parsed = JSON.parse(result);

        parsed.markups[0][1][1].should.equal('__GHOST_URL__/test');
    });

    it('handles options when itemPath is an object', function () {
        const mobiledoc = {
            version: '0.3.1',
            atoms: [],
            cards: [],
            markups: [
                ['a', ['href', '/test']]
            ],
            sections: [
                [1, 'p', [
                    [0, [0], 1, 'Test']
                ]]
            ]
        };
        const serializedMobiledoc = JSON.stringify(mobiledoc);

        const optionsAsItemPath = {
            staticImageUrlPrefix: 'content/images'
        };
        const result = mobiledocToTransformReady(serializedMobiledoc, siteUrl, optionsAsItemPath);
        const parsed = JSON.parse(result);

        parsed.markups[0][1][1].should.equal('__GHOST_URL__/test');
    });

    it('handles options when itemPath is an object and options is null', function () {
        const mobiledoc = {
            version: '0.3.1',
            atoms: [],
            cards: [],
            markups: [
                ['a', ['href', '/test']]
            ],
            sections: [
                [1, 'p', [
                    [0, [0], 1, 'Test']
                ]]
            ]
        };
        const serializedMobiledoc = JSON.stringify(mobiledoc);

        const optionsAsItemPath = {
            staticImageUrlPrefix: 'content/images'
        };
        const result = mobiledocToTransformReady(serializedMobiledoc, siteUrl, optionsAsItemPath, null);
        const parsed = JSON.parse(result);

        parsed.markups[0][1][1].should.equal('__GHOST_URL__/test');
    });

    it('handles empty mobiledoc', function () {
        const mobiledoc = {
            version: '0.3.1',
            atoms: [],
            cards: [],
            markups: [],
            sections: []
        };
        const serializedMobiledoc = JSON.stringify(mobiledoc);

        const result = mobiledocToTransformReady(serializedMobiledoc, siteUrl, itemPath, options);
        const parsed = JSON.parse(result);

        parsed.markups.should.be.an.Array();
        parsed.markups.length.should.equal(0);
        parsed.sections.should.be.an.Array();
        parsed.sections.length.should.equal(0);
    });
});


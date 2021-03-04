// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const mobiledocTransformReadyToRelative = require('../../../lib/utils/mobiledoc-transform-ready-to-relative');

describe('utils: mobiledocTransformReadyToRelative()', function () {
    const siteUrl = 'http://my-ghost-blog.com';
    let options;

    beforeEach(function () {
        options = {
            staticImageUrlPrefix: 'content/images'
        };
    });

    it('converts transform-ready URLs in markups', function () {
        const mobiledoc = {
            version: '0.3.1',
            atoms: [],
            cards: [],
            markups: [
                ['a', ['href', '__GHOST_URL__/inline']],
                ['strong'],
                ['a', ['href', '__GHOST_URL__/formatted']],
                ['a', ['href', '__GHOST_URL__/lists']],
                ['a', ['href', '__GHOST_URL__/section']],
                ['a', ['href', '__GHOST_URL__/']],
                ['a', ['href', 'http://example.com/external/']],
                ['a', ['href', '__GHOST_URL__/content/images/example.jpg']]
            ],
            sections: [
                [1, 'p', [
                    [0, [], 0, 'Links can be '],
                    [0, [0], 1, 'inline'],
                    [0, [], 0, ', and '],
                    [0, [1, 2], 2, 'formatted']
                ]],
                [3, 'ul', [
                    [
                        [0, [], 0, 'and can appear in '],
                        [0, [3], 1, 'lists']
                    ]
                ]],
                [1, 'p', [
                    [0, [4], 1, 'Or be a full section']
                ]],
                [1, 'p', [
                    [0, [5], 1, 'Homepage'],
                    [0, [], 0, ', '],
                    [0, [6], 1, 'external'],
                    [0, [], 0, ', and '],
                    [0, [7], 1, 'content links']
                ]]
            ]
        };
        const serializedMobiledoc = JSON.stringify(mobiledoc);

        const serializedResult = mobiledocTransformReadyToRelative(serializedMobiledoc, siteUrl, options);
        const result = JSON.parse(serializedResult);

        result.markups[0][1][1].should.equal('/inline');
        result.markups[2][1][1].should.equal('/formatted');
        result.markups[3][1][1].should.equal('/lists');
        result.markups[4][1][1].should.equal('/section');
        result.markups[5][1][1].should.equal('/');
        result.markups[6][1][1].should.equal('http://example.com/external/');
        result.markups[7][1][1].should.equal('/content/images/example.jpg');
    });

    it('converts transform-ready URLs in markups with subdir site url', function () {
        const mobiledoc = {
            version: '0.3.1',
            atoms: [],
            cards: [],
            markups: [
                ['a', ['href', '__GHOST_URL__/inline']],
                ['strong'],
                ['a', ['href', '__GHOST_URL__/formatted']],
                ['a', ['href', '__GHOST_URL__/lists']],
                ['a', ['href', '__GHOST_URL__/section']],
                ['a', ['href', '__GHOST_URL__/']],
                ['a', ['href', 'http://example.com/external/']],
                ['a', ['href', '__GHOST_URL__/content/images/example.jpg']]
            ],
            sections: [
                [1, 'p', [
                    [0, [], 0, 'Links can be '],
                    [0, [0], 1, 'inline'],
                    [0, [], 0, ', and '],
                    [0, [1, 2], 2, 'formatted']
                ]],
                [3, 'ul', [
                    [
                        [0, [], 0, 'and can appear in '],
                        [0, [3], 1, 'lists']
                    ]
                ]],
                [1, 'p', [
                    [0, [4], 1, 'Or be a full section']
                ]],
                [1, 'p', [
                    [0, [5], 1, 'Homepage'],
                    [0, [], 0, ', '],
                    [0, [6], 1, 'external'],
                    [0, [], 0, ', and '],
                    [0, [7], 1, 'content links']
                ]]
            ]
        };
        const serializedMobiledoc = JSON.stringify(mobiledoc);

        const serializedResult = mobiledocTransformReadyToRelative(serializedMobiledoc, 'https://example.com/blog/', options);
        const result = JSON.parse(serializedResult);

        result.markups[0][1][1].should.equal('/blog/inline');
        result.markups[2][1][1].should.equal('/blog/formatted');
        result.markups[3][1][1].should.equal('/blog/lists');
        result.markups[4][1][1].should.equal('/blog/section');
        result.markups[5][1][1].should.equal('/blog/');
        result.markups[6][1][1].should.equal('http://example.com/external/');
        result.markups[7][1][1].should.equal('/blog/content/images/example.jpg');
    });

    it('handles anchor markups with no attributes', function () {
        const mobiledoc = {
            version: '0.3.1',
            atoms: [],
            cards: [],
            markups: [
                ['a']
            ],
            sections: []
        };

        const serializedMobiledoc = JSON.stringify(mobiledoc);

        const serializedResult = mobiledocTransformReadyToRelative(serializedMobiledoc, siteUrl, options);
        const result = JSON.parse(serializedResult);

        result.markups[0].should.deepEqual(['a']);
    });

    it('handles anchor markups with multiple attribute pairs', function () {
        const mobiledoc = {
            version: '0.3.1',
            atoms: [],
            cards: [],
            markups: [
                ['a', ['target', '_blank', 'href', '__GHOST_URL__/foo']]
            ],
            sections: []
        };

        const serializedMobiledoc = JSON.stringify(mobiledoc);

        const serializedResult = mobiledocTransformReadyToRelative(serializedMobiledoc, siteUrl, options);
        const result = JSON.parse(serializedResult);

        result.markups[0].should.deepEqual(['a', ['target', '_blank', 'href', '/foo']]);
    });

    it('converts transform-ready URLs in card payloads', function () {
        const mobiledoc = {
            version: '0.3.1',
            atoms: [],
            cards: [
                [
                    'image',
                    {
                        src: '__GHOST_URL__/content/images/2019/09/jf-brou-915UJQaxtrk-unsplash-1.jpg',
                        caption: 'Captions are HTML with <a href="__GHOST_URL__/caption-link/">links</a>'
                    }
                ],
                [
                    'markdown',
                    {
                        markdown: 'Testing [markdown links](__GHOST_URL__/markdown-links)'
                    }
                ],
                [
                    'html',
                    {
                        html: '<a href="__GHOST_URL__/html/">HTML</a> with no card transformer specified'
                    }
                ]
            ],
            markups: [],
            sections: [
                [10, 0],
                [10, 1],
                [10, 2],
                [1, 'p', []]
            ]
        };
        const serializedMobiledoc = JSON.stringify(mobiledoc);

        const serializedResult = mobiledocTransformReadyToRelative(serializedMobiledoc, siteUrl);
        const result = JSON.parse(serializedResult);

        // makes conversion
        result.cards[0][1].src.should.eql('/content/images/2019/09/jf-brou-915UJQaxtrk-unsplash-1.jpg');
        result.cards[0][1].caption.should.eql('Captions are HTML with <a href="/caption-link/">links</a>');
        result.cards[1][1].markdown.should.eql('Testing [markdown links](/markdown-links)');
        result.cards[2][1].html.should.eql('<a href="/html/">HTML</a> with no card transformer specified');

        // does not modify original mobiledoc/payloads
        mobiledoc.cards[0][1].src.should.eql('__GHOST_URL__/content/images/2019/09/jf-brou-915UJQaxtrk-unsplash-1.jpg');
        mobiledoc.cards[0][1].caption.should.eql('Captions are HTML with <a href="__GHOST_URL__/caption-link/">links</a>');
    });
});

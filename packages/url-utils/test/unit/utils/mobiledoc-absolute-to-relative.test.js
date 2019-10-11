// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const sinon = require('sinon');

const mobiledocAbsoluteToRelative = require('../../../lib/utils/mobiledoc-absolute-to-relative');

describe('utils: mobiledocAbsoluteToRelative()', function () {
    const siteUrl = 'http://my-ghost-blog.com';
    let options;

    beforeEach(function () {
        options = {
            staticImageUrlPrefix: 'content/images'
        };
    });

    it('converts absolute URLs in markups', function () {
        const mobiledoc = {
            version: '0.3.1',
            atoms: [],
            cards: [],
            markups: [
                ['a', ['href', 'http://my-ghost-blog.com/inline']],
                ['strong'],
                ['a', ['href', 'http://my-ghost-blog.com/formatted']],
                ['a', ['href', 'http://my-ghost-blog.com/lists']],
                ['a', ['href', 'http://my-ghost-blog.com/section']],
                ['a', ['href', 'http://my-ghost-blog.com/']],
                ['a', ['href', 'http://example.com/external/']],
                ['a', ['href', 'http://my-ghost-blog.com/content/images/example.jpg']]
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

        const serializedResult = mobiledocAbsoluteToRelative(serializedMobiledoc, siteUrl, options);
        const result = JSON.parse(serializedResult);

        result.markups[0][1][1].should.equal('/inline');
        result.markups[2][1][1].should.equal('/formatted');
        result.markups[3][1][1].should.equal('/lists');
        result.markups[4][1][1].should.equal('/section');
        result.markups[5][1][1].should.equal('/');
        result.markups[6][1][1].should.equal('http://example.com/external/');
        result.markups[7][1][1].should.equal('/content/images/example.jpg');
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

        const serializedResult = mobiledocAbsoluteToRelative(serializedMobiledoc, siteUrl, options);
        const result = JSON.parse(serializedResult);

        result.markups[0].should.deepEqual(['a']);
    });

    it('handles anchor markups with multiple attribute pairs', function () {
        const mobiledoc = {
            version: '0.3.1',
            atoms: [],
            cards: [],
            markups: [
                ['a', ['target', '_blank', 'href', 'http://my-ghost-blog.com/foo']]
            ],
            sections: []
        };

        const serializedMobiledoc = JSON.stringify(mobiledoc);

        const serializedResult = mobiledocAbsoluteToRelative(serializedMobiledoc, siteUrl, options);
        const result = JSON.parse(serializedResult);

        result.markups[0].should.deepEqual(['a', ['target', '_blank', 'href', '/foo']]);
    });

    it('handles invalid urls', function () {
        const mobiledoc = {
            version: '0.3.1',
            atoms: [],
            cards: [],
            markups: [
                ['a', ['href', 'http://i%20don’t%20believe%20that%20our%20platform%20should%20take%20that%20down%20because%20i%20think%20there%20are%20things%20that%20different%20people%20get%20wrong']],
                ['a', ['href', 'i%20don’t%20believe%20that%20our%20platform%20should%20take%20that%20down%20because%20i%20think%20there%20are%20things%20that%20different%20people%20get%20wrong']]
            ],
            sections: []
        };

        const serializedMobiledoc = JSON.stringify(mobiledoc);

        const serializedResult = mobiledocAbsoluteToRelative(serializedMobiledoc, siteUrl, options);
        const result = JSON.parse(serializedResult);

        result.markups[0].should.deepEqual(['a', ['href', 'http://i%20don’t%20believe%20that%20our%20platform%20should%20take%20that%20down%20because%20i%20think%20there%20are%20things%20that%20different%20people%20get%20wrong']]);
        result.markups[1].should.deepEqual(['a', ['href', 'i%20don’t%20believe%20that%20our%20platform%20should%20take%20that%20down%20because%20i%20think%20there%20are%20things%20that%20different%20people%20get%20wrong']]);
    });

    it('converts absolute URLs in card payloads using external processors', function () {
        const markdownCardTransformer = {
            name: 'markdown',
            absoluteToRelative: sinon.stub().returns({markdown: 'Testing [markdown links](/markdown-links)'}),
            relativeToAbsolute: sinon.stub().returns({markdown: 'Testing [markdown links](http://my-ghost-blog.com/markdown-links)'})
        };
        const imageCardTransformer = {
            name: 'image',
            absoluteToRelative: sinon.stub().returns({
                src: '/content/images/2019/09/jf-brou-915UJQaxtrk-unsplash-1.jpg',
                caption: 'Captions are HTML with <a href="/caption-link/">links</a>'
            }),
            relativeToAbsolute: sinon.stub().returns({
                src: 'http://my-ghost-blog.com/content/images/2019/09/jf-brou-915UJQaxtrk-unsplash-1.jpg',
                caption: 'Captions are HTML with <a href="http://my-ghost-blog.com/caption-link/">links</a>'
            })
        };

        const cardTransformers = [markdownCardTransformer, imageCardTransformer];

        const mobiledoc = {
            version: '0.3.1',
            atoms: [],
            cards: [
                [
                    'image',
                    {
                        src: 'http://my-ghost-blog.com/content/images/2019/09/jf-brou-915UJQaxtrk-unsplash-1.jpg',
                        caption: 'Captions are HTML with <a href="http://my-ghost-blog.com/caption-link/">links</a>'
                    }
                ],
                [
                    'markdown',
                    {
                        markdown: 'Testing [markdown links](http://my-ghost-blog.com/markdown-links)'
                    }
                ],
                [
                    'html',
                    {
                        html: '<a href="http://my-ghost-blog.com/html/">HTML</a> with no card transformer specified'
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

        const serializedResult = mobiledocAbsoluteToRelative(serializedMobiledoc, siteUrl, {cardTransformers});
        const result = JSON.parse(serializedResult);

        // makes conversion
        result.cards[0][1].src.should.eql('/content/images/2019/09/jf-brou-915UJQaxtrk-unsplash-1.jpg');
        result.cards[0][1].caption.should.eql('Captions are HTML with <a href="/caption-link/">links</a>');
        result.cards[1][1].markdown.should.eql('Testing [markdown links](/markdown-links)');
        result.cards[2][1].html.should.eql('<a href="http://my-ghost-blog.com/html/">HTML</a> with no card transformer specified');

        // calls card transformers
        markdownCardTransformer.absoluteToRelative.calledOnce.should.be.true();
        markdownCardTransformer.absoluteToRelative.firstCall.args[0].should.deepEqual(mobiledoc.cards[1][1]);
        markdownCardTransformer.absoluteToRelative.firstCall.args[0].should.not.equal(mobiledoc.cards[1][1]); // it should be a copy
        markdownCardTransformer.absoluteToRelative.firstCall.args[1].should.deepEqual({
            siteUrl: 'http://my-ghost-blog.com',
            assetsOnly: false,
            secure: false
        });

        imageCardTransformer.absoluteToRelative.calledOnce.should.be.true();
        imageCardTransformer.absoluteToRelative.firstCall.args[0].should.deepEqual(mobiledoc.cards[0][1]);
        imageCardTransformer.absoluteToRelative.firstCall.args[0].should.not.equal(mobiledoc.cards[0][1]); // it should be a copy
        imageCardTransformer.absoluteToRelative.firstCall.args[1].should.deepEqual({
            siteUrl: 'http://my-ghost-blog.com',
            assetsOnly: false,
            secure: false
        });

        markdownCardTransformer.relativeToAbsolute.called.should.be.false();
        imageCardTransformer.relativeToAbsolute.called.should.be.false();

        // does not modify original mobiledoc/payloads
        mobiledoc.cards[0][1].src.should.eql('http://my-ghost-blog.com/content/images/2019/09/jf-brou-915UJQaxtrk-unsplash-1.jpg');
        mobiledoc.cards[0][1].caption.should.eql('Captions are HTML with <a href="http://my-ghost-blog.com/caption-link/">links</a>');
    });
});

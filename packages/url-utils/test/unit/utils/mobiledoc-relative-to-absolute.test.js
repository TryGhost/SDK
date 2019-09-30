// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const sinon = require('sinon');

const mobiledocRelativeToAbsolute = require('../../../lib/utils/mobiledoc-relative-to-absolute');

describe('utils: markdownRelativeToAbsolute()', function () {
    const siteUrl = 'http://my-ghost-blog.com';
    const itemPath = '/my-awesome-post';
    let options;

    beforeEach(function () {
        options = {
            staticImageUrlPrefix: 'content/images'
        };
    });

    it('converts relative URLs in markups', function () {
        const mobiledoc = {
            version: '0.3.1',
            atoms: [],
            cards: [],
            markups: [
                ['a', ['href', '/inline']],
                ['strong'],
                ['a', ['href', '/formatted']],
                ['a', ['href', '/lists']],
                ['a', ['href', '/section']],
                ['a', ['href', '/']],
                ['a', ['href', 'http://example.com/external/']],
                ['a', ['href', '/content/images/example.jpg']]
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

        const serializedResult = mobiledocRelativeToAbsolute(serializedMobiledoc, siteUrl, itemPath, options);
        const result = JSON.parse(serializedResult);

        result.markups[0][1][1].should.equal('http://my-ghost-blog.com/inline');
        result.markups[2][1][1].should.equal('http://my-ghost-blog.com/formatted');
        result.markups[3][1][1].should.equal('http://my-ghost-blog.com/lists');
        result.markups[4][1][1].should.equal('http://my-ghost-blog.com/section');
        result.markups[5][1][1].should.equal('http://my-ghost-blog.com/');
        result.markups[6][1][1].should.equal('http://example.com/external/');
        result.markups[7][1][1].should.equal('http://my-ghost-blog.com/content/images/example.jpg');
    });

    it('converts relative URLs in card payloads using external processors', function () {
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
                        src: '/content/images/2019/09/jf-brou-915UJQaxtrk-unsplash-1.jpg',
                        caption: 'Captions are HTML with <a href="/caption-link/">links</a>'
                    }
                ],
                [
                    'markdown',
                    {
                        markdown: 'Testing [markdown links](/markdown-links)'
                    }
                ],
                [
                    'html',
                    {
                        html: '<a href="/html/">HTML</a> with no card transformer specified'
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

        const serializedResult = mobiledocRelativeToAbsolute(serializedMobiledoc, siteUrl, itemPath, {cardTransformers});
        const result = JSON.parse(serializedResult);

        // makes conversion
        result.cards[0][1].src.should.eql('http://my-ghost-blog.com/content/images/2019/09/jf-brou-915UJQaxtrk-unsplash-1.jpg');
        result.cards[0][1].caption.should.eql('Captions are HTML with <a href="http://my-ghost-blog.com/caption-link/">links</a>');
        result.cards[1][1].markdown.should.eql('Testing [markdown links](http://my-ghost-blog.com/markdown-links)');
        result.cards[2][1].html.should.eql('<a href="/html/">HTML</a> with no card transformer specified');

        // calls card transformers
        markdownCardTransformer.relativeToAbsolute.calledOnce.should.be.true();
        markdownCardTransformer.relativeToAbsolute.firstCall.args[0].should.deepEqual(mobiledoc.cards[1][1]);
        markdownCardTransformer.relativeToAbsolute.firstCall.args[0].should.not.equal(mobiledoc.cards[1][1]); // it should be a copy
        markdownCardTransformer.relativeToAbsolute.firstCall.args[1].should.deepEqual({
            siteUrl: 'http://my-ghost-blog.com',
            itemPath: '/my-awesome-post',
            assetsOnly: false,
            secure: false
        });

        imageCardTransformer.relativeToAbsolute.calledOnce.should.be.true();
        imageCardTransformer.relativeToAbsolute.firstCall.args[0].should.deepEqual(mobiledoc.cards[0][1]);
        imageCardTransformer.relativeToAbsolute.firstCall.args[0].should.not.equal(mobiledoc.cards[0][1]); // it should be a copy
        imageCardTransformer.relativeToAbsolute.firstCall.args[1].should.deepEqual({
            siteUrl: 'http://my-ghost-blog.com',
            itemPath: '/my-awesome-post',
            assetsOnly: false,
            secure: false
        });

        markdownCardTransformer.absoluteToRelative.called.should.be.false();
        imageCardTransformer.absoluteToRelative.called.should.be.false();

        // does not modify original mobiledoc/payloads
        mobiledoc.cards[0][1].src.should.eql('/content/images/2019/09/jf-brou-915UJQaxtrk-unsplash-1.jpg');
        mobiledoc.cards[0][1].caption.should.eql('Captions are HTML with <a href="/caption-link/">links</a>');
    });
});

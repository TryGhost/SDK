// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const fs = require('fs');
const path = require('path');
const transformReadyToAbsolute = require('../../../lib/utils/transform-ready-to-absolute').default;

describe('utils: transformReadyToAbsolute()', function () {
    describe('single url', function () {
        it('returns absolute url using default replacementStr', function () {
            let url = '__GHOST_URL__/my/file.png';
            let root = 'https://example.com';

            transformReadyToAbsolute(url, root)
                .should.equal('https://example.com/my/file.png');
        });

        it('returns absolute url using custom replacementStr', function () {
            let url = '__CUSTOM__/my/file.png';
            let root = 'https://example.com';

            transformReadyToAbsolute(url, root, {replacementStr: '__CUSTOM__'})
                .should.equal('https://example.com/my/file.png');
        });

        it('avoids double slashes with trailing-slash in root url', function () {
            let url = '__GHOST_URL__/my/file.png';
            let root = 'https://example.com/';

            transformReadyToAbsolute(url, root)
                .should.equal('https://example.com/my/file.png');
        });

        it('works with subdirectories in root url', function () {
            let url = '__GHOST_URL__/my/file.png';
            let root = 'https://example.com/subdir/';

            transformReadyToAbsolute(url, root)
                .should.equal('https://example.com/subdir/my/file.png');
        });

        it('returns url as-is with no matching replacementStr', function () {
            let url = 'https://not-transform-ready.com/my/file.png';
            let root = 'https://example.com';

            transformReadyToAbsolute(url, root)
                .should.equal('https://not-transform-ready.com/my/file.png');
        });
    });

    describe('html', function () {
        const siteUrl = 'http://my-ghost-blog.com';
        let options;

        beforeEach(function () {
            options = {};
        });

        it('does not throw on invalid urls', function () {
            const html = '<a href=\\"#\\">Test</a>';
            let result;

            should.doesNotThrow(function () {
                result = transformReadyToAbsolute(html, siteUrl, options);
            });

            result.should.equal('<a href=\\"#\\">Test</a>');
        });

        it('converts a transform-ready URL', function () {
            const html = '<a href="__GHOST_URL__/about#nowhere" title="Relative URL">';
            const result = transformReadyToAbsolute(html, siteUrl, options);

            result.should.containEql('<a href="http://my-ghost-blog.com/about#nowhere" title="Relative URL">');
        });

        it('converts a transform-ready URL including subdirectories', function () {
            const subdirUrl = 'http://my-ghost-blog.com/blog';

            let html = '<a href="__GHOST_URL__/about#nowhere" title="Relative URL">';
            transformReadyToAbsolute(html, subdirUrl, options)
                .should.equal('<a href="http://my-ghost-blog.com/blog/about#nowhere" title="Relative URL">');
        });

        it('keeps html indentation', function () {
            let html = `
<p>
    <a
        href="__GHOST_URL__/test"
        data-test=true
    >
        Test
    </a>
</p>
`;
            let result = transformReadyToAbsolute(html, siteUrl, options);
            result.should.eql(`
<p>
    <a
        href="http://my-ghost-blog.com/test"
        data-test=true
    >
        Test
    </a>
</p>
`);
        });

        /* eslint-disable no-irregular-whitespace */
        it('converts multiple urls', function () {
            let html = `
            <img srcset="__GHOST_URL__/content/images/elva-fairy-320w.jpg 320w,
                            __GHOST_URL__/content/images/elva-fairy-480w.jpg 480w,
                            __GHOST_URL__/content/images/elva-fairy-800w.jpg 800w"
                sizes="(max-width: 320px) 280px,
                        (max-width: 480px) 440px,
                        800px"
                src="__GHOST_URL__/content/images/elva-fairy-800w.jpg" alt="Elva dressed as a fairy">
        `;

            let result = transformReadyToAbsolute(html, siteUrl, options);

            result.should.eql(`
            <img srcset="http://my-ghost-blog.com/content/images/elva-fairy-320w.jpg 320w,
                            http://my-ghost-blog.com/content/images/elva-fairy-480w.jpg 480w,
                            http://my-ghost-blog.com/content/images/elva-fairy-800w.jpg 800w"
                sizes="(max-width: 320px) 280px,
                        (max-width: 480px) 440px,
                        800px"
                src="http://my-ghost-blog.com/content/images/elva-fairy-800w.jpg" alt="Elva dressed as a fairy">
        `);
        });
    /* eslint-enable no-irregular-whitespace */
    });

    describe('markdown', function () {
        const siteUrl = 'http://my-ghost-blog.com';
        let options;

        beforeEach(function () {
            options = {
                staticImageUrlPrefix: 'content/images'
            };
        });

        it('works (demo post)', function () {
            const transformReadyMarkdown = fs.readFileSync(path.join(__dirname, '../../fixtures/long-markdown-transform-ready.md'), 'utf8');
            const absoluteMarkdown = fs.readFileSync(path.join(__dirname, '../../fixtures/long-markdown-absolute.md'), 'utf8');

            transformReadyToAbsolute(transformReadyMarkdown, 'https://demo.ghost.io/', options)
                .should.equal(absoluteMarkdown);
        });

        it('converts transform-ready URLs in markdown', function () {
            const markdown = 'This is a [link](__GHOST_URL__/link) and this is an ![](__GHOST_URL__/content/images/image.png)';

            transformReadyToAbsolute(markdown, siteUrl, options)
                .should.equal('This is a [link](http://my-ghost-blog.com/link) and this is an ![](http://my-ghost-blog.com/content/images/image.png)');
        });

        it('converts transform-ready URLs with subdir site url', function () {
            const markdown = 'This is a [link](__GHOST_URL__/link) and this is an ![](__GHOST_URL__/content/images/image.png)';

            transformReadyToAbsolute(markdown, 'http://my-ghost-blog.com/subdir', options)
                .should.equal('This is a [link](http://my-ghost-blog.com/subdir/link) and this is an ![](http://my-ghost-blog.com/subdir/content/images/image.png)');
        });

        it('converts transform-ready URLs in html', function () {
            const markdown = `
Testing <a href="__GHOST_URL__/link">Inline</a> with **markdown**

<p>
    And block-level <img src="__GHOST_URL__/content/images/image.png">
</p>
        `;

            const result = transformReadyToAbsolute(markdown, siteUrl, options);

            result.should.equal(`
Testing <a href="http://my-ghost-blog.com/link">Inline</a> with **markdown**

<p>
    And block-level <img src="http://my-ghost-blog.com/content/images/image.png">
</p>
        `);
        });

        it('retains whitespace layout', function () {
            const markdown = `

## Testing

    this is a code block
    `;

            const result = transformReadyToAbsolute(markdown, siteUrl, options);

            result.should.equal(`

## Testing

    this is a code block
    `);
        });

        it('retains whitespace layout inside list elements', function () {
            const markdown = '## testing\n\nmctesters\n\n- test\n- line\n- items"';
            transformReadyToAbsolute(markdown, siteUrl, options)
                .should.equal(markdown);
        });

        it('does not strip chars from end', function () {
            const markdown = '<a href="https://example.com">Test</a> <a href="https://example.com/2">Test2</a> Test';

            transformReadyToAbsolute(markdown, siteUrl, options)
                .should.equal(markdown);
        });
    });

    describe('mobiledoc', function () {
        const siteUrl = 'http://my-ghost-blog.com/';
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

            const serializedResult = transformReadyToAbsolute(serializedMobiledoc, siteUrl, options);
            const result = JSON.parse(serializedResult);

            result.markups[0][1][1].should.equal('http://my-ghost-blog.com/inline');
            result.markups[2][1][1].should.equal('http://my-ghost-blog.com/formatted');
            result.markups[3][1][1].should.equal('http://my-ghost-blog.com/lists');
            result.markups[4][1][1].should.equal('http://my-ghost-blog.com/section');
            result.markups[5][1][1].should.equal('http://my-ghost-blog.com/');
            result.markups[6][1][1].should.equal('http://example.com/external/');
            result.markups[7][1][1].should.equal('http://my-ghost-blog.com/content/images/example.jpg');
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

            const serializedResult = transformReadyToAbsolute(serializedMobiledoc, 'https://example.com/blog/', options);
            const result = JSON.parse(serializedResult);

            result.markups[0][1][1].should.equal('https://example.com/blog/inline');
            result.markups[2][1][1].should.equal('https://example.com/blog/formatted');
            result.markups[3][1][1].should.equal('https://example.com/blog/lists');
            result.markups[4][1][1].should.equal('https://example.com/blog/section');
            result.markups[5][1][1].should.equal('https://example.com/blog/');
            result.markups[6][1][1].should.equal('http://example.com/external/');
            result.markups[7][1][1].should.equal('https://example.com/blog/content/images/example.jpg');
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

            const serializedResult = transformReadyToAbsolute(serializedMobiledoc, siteUrl, options);
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

            const serializedResult = transformReadyToAbsolute(serializedMobiledoc, siteUrl, options);
            const result = JSON.parse(serializedResult);

            result.markups[0].should.deepEqual(['a', ['target', '_blank', 'href', 'http://my-ghost-blog.com/foo']]);
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

            const serializedResult = transformReadyToAbsolute(serializedMobiledoc, siteUrl);
            const result = JSON.parse(serializedResult);

            // makes conversion
            result.cards[0][1].src.should.eql('http://my-ghost-blog.com/content/images/2019/09/jf-brou-915UJQaxtrk-unsplash-1.jpg');
            result.cards[0][1].caption.should.eql('Captions are HTML with <a href="http://my-ghost-blog.com/caption-link/">links</a>');
            result.cards[1][1].markdown.should.eql('Testing [markdown links](http://my-ghost-blog.com/markdown-links)');
            result.cards[2][1].html.should.eql('<a href="http://my-ghost-blog.com/html/">HTML</a> with no card transformer specified');

            // does not modify original mobiledoc/payloads
            mobiledoc.cards[0][1].src.should.eql('__GHOST_URL__/content/images/2019/09/jf-brou-915UJQaxtrk-unsplash-1.jpg');
            mobiledoc.cards[0][1].caption.should.eql('Captions are HTML with <a href="__GHOST_URL__/caption-link/">links</a>');
        });
    });
});

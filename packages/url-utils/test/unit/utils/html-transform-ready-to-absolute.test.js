// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../../utils');

const htmlTransformReadyToAbsolute = require('../../../lib/utils/html-transform-ready-to-absolute');

describe('utils: htmlTransformReadyToAbsolute()', function () {
    const siteUrl = 'http://my-ghost-blog.com';
    let options;

    beforeEach(function () {
        options = {};
    });

    it('does not throw on invalid urls', function () {
        const html = '<a href=\\"#\\">Test</a>';
        let result;

        should.doesNotThrow(function () {
            result = htmlTransformReadyToAbsolute(html, siteUrl, options);
        });

        result.should.equal('<a href=\\"#\\">Test</a>');
    });

    it('converts a transform-ready URL', function () {
        const html = '<a href="__GHOST_URL__/about#nowhere" title="Relative URL">';
        const result = htmlTransformReadyToAbsolute(html, siteUrl, options);

        result.should.containEql('<a href="http://my-ghost-blog.com/about#nowhere" title="Relative URL">');
    });

    it('converts a transform-ready URL including subdirectories', function () {
        const subdirUrl = 'http://my-ghost-blog.com/blog';

        let html = '<a href="__GHOST_URL__/about#nowhere" title="Relative URL">';
        htmlTransformReadyToAbsolute(html, subdirUrl, options)
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
        let result = htmlTransformReadyToAbsolute(html, siteUrl, options);
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

        let result = htmlTransformReadyToAbsolute(html, siteUrl, options);

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

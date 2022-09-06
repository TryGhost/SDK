require('./utils');

const escapeHtml = require('../lib').escapeHtml;
const jsdom = require('jsdom');

describe('Escape HTML', function () {
    it('escapes all characters', function () {
        const result = escapeHtml(`<tag>"Black" & 'White'</tag>`);
        result.should.equal(`&lt;tag&gt;&quot;Black&quot; &amp; &apos;White&apos;&lt;/tag&gt;`);
    });

    it('produces valid HTML attributes', function () {
        const myAttribute = `><tag>"Black" & 'White'</tag>`;
        const htmls = [
            `<input value="${escapeHtml(myAttribute)}" type="text" />`,
            `<input value='${escapeHtml(myAttribute)}' type='text' />`
        ];

        for (const html of htmls) {
            const dom = new jsdom.JSDOM(html);
            should(dom.window.document.querySelector('input').getAttribute('value')).equal(myAttribute);
            should(dom.window.document.querySelector('input').value).equal(myAttribute);
        }
    });

    it('produces valid HTML text', function () {
        const texts = [
            `<tag>"Black" & 'White'</tag>`,
            `<![CDATA[This is no data]]>`,
            `<!--This is no comment-->`,
            `</p>This doesn't end<p>`
        ];
        const htmls = texts.map(text => [
            `<p>${escapeHtml(text)}</p>`
        ]);

        for (const [index, html] of htmls.entries()) {
            const text = texts[index];
            const dom = new jsdom.JSDOM(html);
            should(dom.window.document.querySelector('p').textContent).equal(text);
            should(dom.window.document.querySelector('p').innerHTML).not.equal(text);
        }
    });
});

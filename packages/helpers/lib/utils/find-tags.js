import isString from 'lodash-es/isString';

const GREATER_THAN = '>'.charCodeAt(0);
const DOUBLE_QUOTE = '"'.charCodeAt(0);
const SINGLE_QUOTE = '\''.charCodeAt(0);

/**
 * Tag finder Utility
 * @param {string} html
 * @param {string} opening - the exact (case-sensitive) characters a tag has to start with, e.g. `<` or `<img`
 * @returns {{start: number, end: number}[]} position of every tag, `end` is exclusive
 * @description Finds the same tags, in the same order, as the regular expression
 * `opening("[^"]*"|'[^']*'|[^'">])+\/?>` with the global flag does, but always in linear time.
 * The regular expression takes quadratic time on input that contains many unclosed tags,
 * because it scans to the end of the input again for each one of them.
 **/
export default function findTags(html, opening) {
    // the regular expression could only be used on strings
    if (!isString(html)) {
        throw new TypeError('html must be a string');
    }

    const tags = [];
    // positions outside of quotes from which no closing `>` can be reached,
    // only allocated once an unclosed tag was found
    let deadEnds = null;

    // returns the position after the closing `>` of the tag whose content starts at `from`,
    // or -1 when there is no tag because it is empty or never closed
    function findTagEnd(from, markDeadEnds) {
        let position = from;

        while (position < html.length && !(deadEnds && deadEnds[position])) {
            const character = html.charCodeAt(position);

            if (character === GREATER_THAN) {
                // a tag needs at least one character of content
                return position > from ? position + 1 : -1;
            }

            if (markDeadEnds) {
                deadEnds = deadEnds || new Uint8Array(html.length);
                deadEnds[position] = 1;
            }

            if (character === DOUBLE_QUOTE || character === SINGLE_QUOTE) {
                // a `>` inside of a quoted attribute value doesn't close the tag
                const closingQuote = html.indexOf(html.charAt(position), position + 1);

                if (closingQuote === -1) {
                    return -1;
                }

                position = closingQuote + 1;
            } else {
                position += 1;
            }
        }

        return -1;
    }

    let start = html.indexOf(opening);

    while (start !== -1) {
        const contentStart = start + opening.length;
        const end = findTagEnd(contentStart, false);

        if (end === -1) {
            // go through the unclosed tag a second time to mark its positions as dead ends.
            // Later tags stop as soon as they reach one of them, so every position is
            // only looked at a constant number of times, which is what keeps this linear.
            // Doing it in a second pass means that nothing is allocated or marked for
            // input in which every tag is closed
            findTagEnd(contentStart, true);
            start = html.indexOf(opening, start + 1);
        } else {
            tags.push({start, end});
            start = html.indexOf(opening, end);
        }
    }

    return tags;
}

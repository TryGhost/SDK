/**
 * Image count Utility
 * @param {string} html
 * @returns {integer} image count
 * @description Takes an HTML string and returns the number of images
 **/
export default function countImages(html) {
    if (!html) {
        return 0;
    }
    // protect against Handlebars.SafeString
    if (html.hasOwnProperty('string')) {
        html = html.string;
    }
    return (html.match(/<img(.|\n)*?>/g) || []).length;
}

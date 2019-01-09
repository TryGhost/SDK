/**
 * Image count Utility
 * @param {string} html
 * @returns {integer} image count
 * @description Takes an HTML string and returns the number of images
 **/
export default function countImages(html) {
    return (html.match(/<img(.|\n)*?>/g) || []).length;
}

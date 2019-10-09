import countImages from './count-images';
import countWords from './count-words';

export function estimatedReadingTimeInMinutes({wordCount, imageCount}) {
    const wordsPerMinute = 275;
    const wordsPerSecond = wordsPerMinute / 60;
    let readingTimeSeconds = wordCount / wordsPerSecond;

    // add 12 seconds for the first image, 11 for the second, etc. limiting at 3
    for (var i = 12; i > 12 - imageCount; i -= 1) {
        readingTimeSeconds += Math.max(i, 3);
    }

    let readingTimeMinutes = Math.round(readingTimeSeconds / 60);

    return readingTimeMinutes;
}
/**
 * Reading minutes method
 *
 * @param {string} html - HTML that we want to calculate reading time for
 * @param {string} additionalImages - additional images that need to be taken into account outside HTML
 * @returns {number} estimated reading in minutes
 */

export default function readingMinutes(html, additionalImages) {
    if (!html) {
        return '';
    }

    let imageCount = countImages(html);
    let wordCount = countWords(html);

    if (additionalImages) {
        imageCount += additionalImages;
    }

    return estimatedReadingTimeInMinutes({wordCount, imageCount});
}

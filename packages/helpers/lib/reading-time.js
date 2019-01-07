import countImages from './utils/count-images';
import countWords from './utils/count-words';

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
 * Reading Time Helper
 *
 * @param {{html: String, feature_image: [String|null]}} post - post with HTML that we want to calculate reading time for
 * @param {object} options - output options
 * @param {string} [options.minute="1 min read"] - format for reading times <= 1 minute
 * @param {string} [options.minutes="% min read"] - format for reading times > 1 minute
 * @returns {string} estimated reading in minutes
 */

export default function (post, options = {}) {
    const html = post.html;
    const minuteStr = typeof options.minute === 'string' ? options.minute : '1 min read';
    const minutesStr = typeof options.minutes === 'string' ? options.minutes : '% min read';

    if (!html) {
        return '';
    }

    let imageCount = countImages(html);
    let wordCount = countWords(html);

    if (post.feature_image) {
        imageCount += 1;
    }

    const readingTimeInMinutes = estimatedReadingTimeInMinutes({wordCount, imageCount});
    let readingTime = '';

    if (readingTimeInMinutes <= 1) {
        readingTime = minuteStr;
    } else {
        readingTime = minutesStr.replace('%', readingTimeInMinutes);
    }

    return readingTime;
}

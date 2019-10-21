import readingMinutes from './utils/reading-minutes';

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
    const minuteStr = typeof options.minute === 'string' ? options.minute : '1 min read';
    const minutesStr = typeof options.minutes === 'string' ? options.minutes : '% min read';

    if (!post.html && !post.reading_time) {
        return '';
    }

    let imageCount = 0;

    if (post.feature_image) {
        imageCount += 1;
    }

    const time = post.reading_time || readingMinutes(post.html, imageCount);
    let readingTime = '';

    if (time <= 1) {
        readingTime = minuteStr;
    } else {
        readingTime = minutesStr.replace('%', time);
    }

    return readingTime;
}

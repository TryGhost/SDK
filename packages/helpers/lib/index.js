import * as visibility from './utils/visibility';
import countWords from './utils/count-words';
import countImages from './utils/count-images';
import readingTimeForHtml from './utils/reading-time-from-html';

export const utils = {
    countImages,
    countWords,
    visibility,
    readingTimeForHtml
};

export {default as readingTime} from './reading-time';
export {default as tags} from './tags';

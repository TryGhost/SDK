import * as visibility from './utils/visibility';
import countWords from './utils/count-words';
import countImages from './utils/count-images';
import readingMinutes from './utils/reading-minutes';

export const utils = {
    countImages,
    countWords,
    visibility,
    readingMinutes
};

export {default as readingTime} from './reading-time';
export {default as tags} from './tags';

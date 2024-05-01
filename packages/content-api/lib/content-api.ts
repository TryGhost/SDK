import {createApi} from './create-api';
import {defaultMakeRequest} from './request';
import {UserInputs} from './types';
import {validate} from './validate';

/**
 * @description Ghost Content API Client
 * @see https://ghost.org/docs/content-api/javascript/
 *
 */
export default function ghostContentApi({
    url,
    key,
    acceptVersionHeader,
    userAgent,
    ghostPath = 'ghost',
    makeRequest = defaultMakeRequest
}: UserInputs) {
    const validatedInputs = validate({acceptVersionHeader, url, ghostPath, key, userAgent});
    userAgent = validatedInputs.userAgent;
    acceptVersionHeader = validatedInputs.acceptVersionHeader;

    return createApi({url, key, ghostPath, acceptVersionHeader, userAgent, makeRequest});
}

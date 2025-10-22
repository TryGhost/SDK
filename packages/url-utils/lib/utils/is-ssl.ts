// require the whatwg compatible URL library (same behaviour in node and browser)
import {URL} from 'url';

function isSSL(urlToParse: string): boolean {
    const {protocol} = new URL(urlToParse);
    return protocol === 'https:';
}

export = isSSL;

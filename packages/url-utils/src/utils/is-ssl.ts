import {URL} from 'url';

function isSSL(urlToParse: string): boolean {
    const {protocol} = new URL(urlToParse);
    return protocol === 'https:';
}

export default isSSL;

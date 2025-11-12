import {URL} from 'url';
import absoluteToTransformReady from './absolute-to-transform-ready';

function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface PlaintextAbsoluteToTransformReadyOptions {
    replacementStr?: string;
    withoutSubdirectory?: boolean;
}

const plaintextAbsoluteToTransformReady = function plaintextAbsoluteToTransformReady(
    plaintext: string,
    rootUrl: string,
    itemPath?: string | PlaintextAbsoluteToTransformReadyOptions | null,
    options?: PlaintextAbsoluteToTransformReadyOptions
): string {
    // itemPath is optional, if it's an object may be the options param instead
    let actualOptions: PlaintextAbsoluteToTransformReadyOptions;
    
    if (itemPath && typeof itemPath === 'object' && !options) {
        actualOptions = itemPath;
    } else {
        actualOptions = options || {};
    }

    // plaintext links look like "Link title [url]"
    // those links are all we care about so we can do a fast regex here
    const rootURL = new URL(rootUrl);
    const escapedRootUrl = escapeRegExp(`${rootURL.hostname}${rootURL.pathname.replace(/\/$/, '')}`);
    const linkRegex = new RegExp(` \\[(https?://${escapedRootUrl}.*?)\\]`, 'g');

    return plaintext.replace(linkRegex, function (_fullMatch: string, url: string): string {
        const newUrl = absoluteToTransformReady(`${url}`, rootUrl, actualOptions);
        return ` [${newUrl}]`;
    });
};

export default plaintextAbsoluteToTransformReady;

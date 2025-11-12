import {URL} from 'url';
import absoluteToTransformReady from './absolute-to-transform-ready';

export interface PlaintextAbsoluteToTransformReadyOptions {
    replacementStr?: string;
    withoutSubdirectory?: boolean;
    assetsOnly?: boolean;
    staticImageUrlPrefix?: string;
}

function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const plaintextAbsoluteToTransformReady = function plaintextAbsoluteToTransformReady(plaintext: string, rootUrl: string, itemPath?: string | PlaintextAbsoluteToTransformReadyOptions, options?: PlaintextAbsoluteToTransformReadyOptions): string {
    // itemPath is optional, if it's an object may be the options param instead
    if (typeof itemPath === 'object' && !options) {
        options = itemPath;
        itemPath = undefined;
    }

    // plaintext links look like "Link title [url]"
    // those links are all we care about so we can do a fast regex here
    const rootURL = new URL(rootUrl);
    const escapedRootUrl = escapeRegExp(`${rootURL.hostname}${rootURL.pathname.replace(/\/$/, '')}`);
    const linkRegex = new RegExp(` \\[(https?://${escapedRootUrl}.*?)\\]`, 'g');

    return plaintext.replace(linkRegex, function (fullMatch: string, url: string): string {
        const newUrl = absoluteToTransformReady(`${url}`, rootUrl, options);
        return ` [${newUrl}]`;
    });
};

export default plaintextAbsoluteToTransformReady;

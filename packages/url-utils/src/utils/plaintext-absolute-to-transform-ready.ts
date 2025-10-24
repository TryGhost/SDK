import absoluteToTransformReady, {type AbsoluteToTransformReadyOptionsInput} from './absolute-to-transform-ready';

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const plaintextAbsoluteToTransformReady = function plaintextAbsoluteToTransformReady(
    plaintext: string,
    rootUrl: string,
    itemPath?: string | AbsoluteToTransformReadyOptionsInput | null,
    options?: AbsoluteToTransformReadyOptionsInput
): string {
    // itemPath is optional, if it's an object may be the options param instead
    if (typeof itemPath === 'object' && itemPath !== null && !options) {
        options = itemPath;
        itemPath = null;
    }

    // plaintext links look like "Link title [url]"
    // those links are all we care about so we can do a fast regex here
    const rootURL = new URL(rootUrl);
    const escapedRootUrl = escapeRegExp(`${rootURL.hostname}${rootURL.pathname.replace(/\/$/, '')}`);
    const linkRegex = new RegExp(` \\[(https?://${escapedRootUrl}.*?)\\]`, 'g');

    return plaintext.replace(linkRegex, function (fullMatch, url) {
        const newUrl = absoluteToTransformReady(`${url}`, rootUrl, options);
        return ` [${newUrl}]`;
    });
};

export default plaintextAbsoluteToTransformReady;

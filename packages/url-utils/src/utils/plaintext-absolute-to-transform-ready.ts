import type {AbsoluteToTransformReadyOptionsInput, BaseUrlOptionsInput} from './types';
import absoluteToTransformReady from './absolute-to-transform-ready';
import buildEarlyExitMatchModule from './build-early-exit-match';
const {escapeRegExp} = buildEarlyExitMatchModule;
import {URL} from 'url';

type PlaintextAbsoluteToTransformReadyOptions = AbsoluteToTransformReadyOptionsInput & BaseUrlOptionsInput;
type PlaintextAbsoluteToTransformReadyOptionsInput = Partial<PlaintextAbsoluteToTransformReadyOptions>;

function buildLinkRegex(rootUrl: string, options: PlaintextAbsoluteToTransformReadyOptionsInput = {}): RegExp | null {
    // Build a regex that matches links from ANY configured base URL (site + CDNs)
    const baseUrls = [rootUrl, options.imageBaseUrl, options.filesBaseUrl, options.mediaBaseUrl]
        .filter((value): value is string => Boolean(value));

    const patterns = baseUrls.map((baseUrl: string) => {
        const parsed = new URL(baseUrl);
        const escapedUrl = escapeRegExp(`${parsed.hostname}${parsed.pathname.replace(/\/$/, '')}`);
        return escapedUrl;
    });

    if (!patterns.length) {
        return null;
    }

    const pattern = patterns.length === 1 ? patterns[0] : `(?:${patterns.join('|')})`;
    return new RegExp(` \\[(https?://${pattern}.*?)\\]`, 'g');
}

const plaintextAbsoluteToTransformReady = function plaintextAbsoluteToTransformReady(
    plaintext: string,
    rootUrl: string,
    itemPath: string | null | PlaintextAbsoluteToTransformReadyOptionsInput,
    options?: PlaintextAbsoluteToTransformReadyOptionsInput
): string {
    // itemPath is optional, if it's an object may be the options param instead
    let finalOptions: PlaintextAbsoluteToTransformReadyOptionsInput = options || {};

    if (typeof itemPath === 'object' && itemPath !== null && !options) {
        finalOptions = itemPath;
    }

    // plaintext links look like "Link title [url]"
    // those links are all we care about so we can do a fast regex here
    const linkRegex = buildLinkRegex(rootUrl, finalOptions);

    return plaintext.replace(linkRegex as RegExp, function (fullMatch: string, url: string): string {
        const newUrl = absoluteToTransformReady(`${url}`, rootUrl, finalOptions);
        return ` [${newUrl}]`;
    });
};

export default plaintextAbsoluteToTransformReady;

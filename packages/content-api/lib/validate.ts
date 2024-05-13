import {UserInputs} from './types';

// @NOTE: this value is dynamically replaced based on browser/node environment
export const USER_AGENT_DEFAULT = true;
export const defaultAcceptVersionHeader = 'v5.0';
export const name = '@tryghost/content-api';

function validateAcceptVersionHeader(version: string | boolean | undefined) {
    if (!version || version === undefined || version === 'canary' || typeof version === 'boolean') {
        if (version === 'canary') {
            // eslint-disable-next-line
            console.warn(
                `[${name}]: The version parameter, "canary," is deprecated. Please use "v{major}.{minor}" instead.`
            );
        }
        return defaultAcceptVersionHeader;
    }

    const major = version.match(/^v([2-5])$/);
    if (major && major[1]) {
        // eslint-disable-next-line
        console.warn(
            `[${name}]: The version parameter, "v{major}," is deprecated. Please use "v{major}.{minor}" instead.`
        );
        return `v${major[1]}.0`;
    }

    if (typeof version === 'string' && !/^v[2-5]\.\d+/.test(version)) {
        throw new Error(
            `[${name}]: Config invalid. The "version" parameter, ${version}, is not supported/`
        );
    }

    return version;
}

function validateUrl(url: string) {
    if (!url) {
        throw new Error(
            `[${name}]: Config missing. The "url" parameter is required (e.g., "https://ghost-site.com").`
        );
    }

    if (!/https?:\/\//.test(url)) {
        throw new Error(
            `[${name}]: Config invalid. The ${url} parameter requires a protocol (e.g., "https://ghost-site.com").`
        );
    }

    if (url.endsWith('/')) {
        throw new Error(
            `[${name}]: Config invalid. The ${url} must not have a trailing slash (e.g., "https://ghost-site.com").`
        );
    }
}

function validateGhostPath(ghostPath: string | undefined) {
    if (!ghostPath) {
        return;
    }

    if (ghostPath.endsWith('/') || ghostPath.startsWith('/')) {
        throw new Error(
            `[${name}]: Config invalid. The ${ghostPath} must not have a leading or trailing slash (e.g., "ghost").`
        );
    }
}

function validateKey(key: string) {
    if (!key) {
        throw new Error(
            `[${name}]: Config missing. The "key" parameter is required (e.g., "64dbaf71a0a7069d8fd8de58f1").`
        );
    }
}

function validateUserAgent(userAgent: string | boolean | undefined) {
    if (userAgent === false) {
        return undefined;
    }

    if (!userAgent) {
        return USER_AGENT_DEFAULT;
    }

    return userAgent;
}

export function validate({
    acceptVersionHeader,
    url,
    ghostPath,
    key,
    userAgent
}: UserInputs) {
    acceptVersionHeader = validateAcceptVersionHeader(acceptVersionHeader);
    validateUrl(url);
    validateGhostPath(ghostPath);
    validateKey(key);
    userAgent = validateUserAgent(userAgent);
    return {acceptVersionHeader, userAgent};
}

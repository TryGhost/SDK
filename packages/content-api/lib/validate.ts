import {UserInputs} from './types';

// @NOTE: this value is dynamically replaced based on browser/node environment
export const USER_AGENT_DEFAULT = true;
export const defaultAcceptVersionHeader = 'v5.0';
export const supportedVersions = ['v2', 'v3', 'v4', 'v5', 'canary'];
export const name = '@tryghost/content-api';

function validateAcceptVersionHeader(version: string | boolean | undefined) {
    if (version === undefined) {
        return defaultAcceptVersionHeader;
    }

    if (typeof version === 'boolean') {
        return defaultAcceptVersionHeader;
    } else if (
        version &&
        !supportedVersions.includes(version) &&
        !version.match(/^v\d+\.\d+/)
    ) {
        throw new Error(
            `${name} Config Invalid: 'version' ${version} is not supported`
        );
    } else {
        if (version === 'canary') {
            // eslint-disable-next-line
            console.warn(
                `${name}: The 'version' parameter has a deprecated format 'canary', please use 'v{major}.{minor}' format instead`
            );

            return defaultAcceptVersionHeader;
        } else if (version.match(/^v\d+$/)) {
            // eslint-disable-next-line
            console.warn(
                `${name}: The 'version' parameter has a deprecated format 'v{major}', please use 'v{major}.{minor}' format instead`
            );

            return `${version}.0`;
        } else {
            return version;
        }
    }
}

function validateUrl(url: string) {
    if (!url) {
        throw new Error(
            `${name} Config Missing: 'url' is required. E.g. 'https://site.com'`
        );
    }

    if (!/https?:\/\//.test(url)) {
        throw new Error(
            `${name} Config Invalid: 'url' ${url} requires a protocol. E.g. 'https://site.com'`
        );
    }

    if (url.endsWith('/')) {
        throw new Error(
            `${name} Config Invalid: 'url' ${url} must not have a trailing slash. E.g. 'https://site.com'`
        );
    }
}

function validateGhostPath(ghostPath: string | undefined) {
    if (!ghostPath) {
        return;
    }

    if (ghostPath.endsWith('/') || ghostPath.startsWith('/')) {
        throw new Error(
            `${name} Config Invalid: 'ghostPath' ${ghostPath} must not have a leading or trailing slash. E.g. 'ghost'`
        );
    }
}

function validateKey(key: string) {
    if (!key) {
        throw new Error(`${name} Config Missing: 'key' is required.`);
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
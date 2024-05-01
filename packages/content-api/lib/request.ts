import {Params, ParamsWithKey, IdOrSlug} from './types';

// __version__ is replaced at compile time by the package version from package.json
declare const __version__: string;
const packageVersion = __version__;

type MakeApiRequestParams = {
    resourceType: string;
    options?: Partial<ParamsWithKey>;
    identifier?: IdOrSlug;
    membersToken?: string | null;
    key: string;
    url: string;
    ghostPath: string;
    userAgent: string | boolean | undefined;
    acceptVersionHeader: string | undefined;
    makeRequest: ({
        url,
        method,
        options,
        headers
    }: RequestInit & {
        url: string;
        options?: Partial<ParamsWithKey>;
    }) => Promise<Response>; // TODO - serialize options before passing to makeRequest (as part of url...).
};

export async function makeApiRequest({
    resourceType,
    options,
    identifier,
    membersToken = null,
    key,
    url,
    ghostPath,
    userAgent,
    acceptVersionHeader,
    makeRequest
}: MakeApiRequestParams): Promise<Response> {
    if (!membersToken && !key) {
        return Promise.reject(new Error(`Config missing: 'key' is required.`));
    }

    if (options) {
        delete options.id;
    }

    const requestHeaders: HeadersInit = membersToken
        ? // Using the Headers constructor provides additional compatibility across environments
        new Headers({
            Authorization: `GhostMembers ${membersToken}`
        })
        : new Headers({});

    if (userAgent) {
        if (typeof userAgent === 'boolean') {
            requestHeaders.set(
                'User-Agent',
                `GhostContentSDK/${packageVersion}`
            );
        } else {
            requestHeaders.set('User-Agent', `${userAgent}`);
        }
    }

    if (acceptVersionHeader) {
        requestHeaders.set('Accept-Version', acceptVersionHeader);
    }

    options = {key, ...options};

    let data;

    if (identifier) {
        data = identifier.id ? identifier.id : `slug/${identifier.slug}`;
    }

    const apiUrl = `${url}/${ghostPath}/api/content/${resourceType}/${
        data ? data + '/' : ''
    }`;

    try {
        const res = await makeRequest({
            url: apiUrl,
            method: 'GET',
            options,
            headers: requestHeaders
        });

        return res;
    } catch (err: unknown) {
        if (err instanceof Error) {
            throw new Error(err.message);
        } else {
            throw new Error('An unknown error occurred');
        }
    }
}

export async function defaultMakeRequest({
    url,
    method,
    options,
    headers
}: RequestInit & {
    url: string;
    options?: Partial<Params>;
}): Promise<Response> {
    const serializedParams = new URLSearchParams(
        options as Record<string, string>
    ).toString();

    const urlObj = new URL(url);
    urlObj.search = serializedParams;
    try {
        const res = await fetch(urlObj, {method, headers});
        if (!res.ok) {
            throw new Error(res.statusText); // Ghost error?
        }
        return res;
    } catch (err: unknown) {
        if (err instanceof Error) {
            throw new Error(err.message);
        } else {
            throw new Error('An unknown error occurred');
        }
    }
}

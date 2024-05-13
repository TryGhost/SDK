import {Params, ParamsWithKey, IdOrSlug} from './types';
import {name} from './validate';

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
        return Promise.reject(new Error(`[${name}]: Config missing. The "key" parameter is required (e.g., "64dbaf71a0a7069d8fd8de58f1").`));
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
        if (err instanceof APIError) {
            throw err;
        }
        if (err instanceof Error) {
            err.message = `[${name}]: ${err.message}`;
            throw err;
        } else {
            throw new Error(`[${name}]: An unknown error occurred.`);
        }
    }
}

class APIError extends Error {
    response: Response;

    constructor(message: string, type: string, response: Response) {
        super(message);
        this.name = type;
        this.response = response;
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
            const errorPayload = await res.json();

            if (errorPayload.errors) {
                const props = errorPayload.errors[0];

                const toThrow = new APIError(props.message, props.type, res);
                
                const keys = Object.keys(props);
                for (const key of keys) {
                    toThrow[key as keyof Error] = props[key];
                };

                throw toThrow;
            } else {
                throw new Error(`${res.status} - ${res.statusText}`);
            };
        }
        return res;
    } catch (err: unknown) {
        if (err instanceof Error) {
            throw err;
        } else {
            throw new Error(`An unknown error occurred: ${(err as Error).toString()}`);
        }
    }
}

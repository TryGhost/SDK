import {makeApiRequest} from './request';
import {
    BrowseParams,
    IdOrSlug,
    Meta,
    ParamsWithKey,
    ReadParams,
    ResourceMap,
    UserInputs
} from './types';

type ValidatedInputs = Omit<UserInputs, 'ghostPath'> &
    Omit<UserInputs, 'makeRequest'> & {
        ghostPath: string;
        makeRequest: ({
            url,
            method,
            options,
            headers
        }: RequestInit & {
            url: string;
            options?: Partial<ParamsWithKey>;
        }) => Promise<Response>;
    };

async function createBrowseMethod<T extends keyof ResourceMap>(
    resource: T,
    config: ValidatedInputs,
    params: BrowseParams
): Promise<
    { [K in T]: ResourceMap[K][] } & { meta: Meta } & {
        response: Response;
        headers: Headers;
        status: number;
        body: ReadableStream<Uint8Array>;
    }
> {
    const {key, ghostPath, userAgent, acceptVersionHeader, makeRequest, url} =
        config;

    const response = await makeApiRequest({
        resourceType: resource,
        options: params,
        key,
        url,
        ghostPath,
        userAgent,
        acceptVersionHeader,
        makeRequest
    });

    const json = await response.json();

    return {
        [resource]: json[resource],
        meta: json.meta,
        response: response,
        headers: response.headers,
        status: response.status,
        body: response.body
    } as { [K in T]: ResourceMap[K][] } & { meta: Meta } & {
        response: Response;
        headers: Headers;
        status: number;
        body: ReadableStream<Uint8Array>;
    };
}

async function createReadMethod<T extends keyof ResourceMap>(
    resource: T,
    config: ValidatedInputs,
    identifier: IdOrSlug,
    params: ReadParams
): Promise<
    { [K in T]: ResourceMap[T] } & {
        response: Response;
        headers: Headers;
        status: number;
        body: ReadableStream<Uint8Array>;
    }
> {
    const {key, ghostPath, userAgent, acceptVersionHeader, makeRequest, url} =
        config;

    const response = await makeApiRequest({
        resourceType: resource,
        options: params,
        key,
        url,
        ghostPath,
        userAgent,
        acceptVersionHeader,
        makeRequest
    });

    const json = await response.json();

    return {
        [resource]: json[resource],
        response: response,
        headers: response.headers,
        status: response.status,
        body: response.body
    } as { [K in T]: ResourceMap[K] } & {
        response: Response;
        headers: Headers;
        status: number;
        body: ReadableStream<Uint8Array>;
    };
}

// TODO - The code below isn't dry. It'd be better to use reduce/loop with a mapped type to generate the methods. However, the TS lsp had trouble understanding the return types when I tried this.
export function createApi({
    url,
    key,
    ghostPath,
    userAgent,
    acceptVersionHeader,
    makeRequest
}: ValidatedInputs) {
    const config = {
        url,
        key,
        ghostPath,
        userAgent,
        acceptVersionHeader,
        makeRequest
    };

    return {
        posts: {
            browse: (params: BrowseParams = {}) => createBrowseMethod<'posts'>('posts', config, params),
            read: (identifier: IdOrSlug, params: ReadParams = {}) => createReadMethod<'posts'>('posts', config, identifier, params)
        },
        authors: {
            browse: (params: BrowseParams = {}) => createBrowseMethod<'authors'>('authors', config, params),
            read: (identifier: IdOrSlug, params: ReadParams = {}) => createReadMethod<'authors'>(
                'authors',
                config,
                identifier,
                params
            )
        },
        tags: {
            browse: (params: BrowseParams = {}) => createBrowseMethod<'tags'>('tags', config, params),
            read: (identifier: IdOrSlug, params: ReadParams = {}) => createReadMethod<'tags'>('tags', config, identifier, params)
        },
        newsletters: {
            browse: (params: BrowseParams = {}) => createBrowseMethod<'newsletters'>(
                'newsletters',
                config,
                params
            )
        },
        pages: {
            browse: (params: BrowseParams = {}) => createBrowseMethod<'pages'>('pages', config, params),
            read: (identifier: IdOrSlug, params: ReadParams = {}) => createReadMethod<'pages'>('pages', config, identifier, params)
        },
        tiers: {
            browse: (params: BrowseParams = {}) => createBrowseMethod<'tiers'>('tiers', config, params)
        },
        settings: {
            browse: (params: BrowseParams = {}) => createBrowseMethod<'settings'>('settings', config, params)
        },
        recommendations: {
            browse: (params: BrowseParams = {}) => createBrowseMethod<'recommendations'>(
                'recommendations',
                config,
                params
            )
        },
        offers: {
            read: (identifier: IdOrSlug, params: ReadParams = {}) => createReadMethod<'offers'>(
                'offers',
                config,
                identifier,
                params
            )
        }
    };
}

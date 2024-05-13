import {afterAll, afterEach, beforeAll} from 'vitest';
import {setupServer} from 'msw/node';
import {HttpResponse, http} from 'msw';
import {describe, it, expect} from 'vitest';
import ghostContentApi from '../lib/content-api';

const useMockApi = process.env.USE_MOCK_API === 'true';

const config = {
    url: 'http://127.0.0.1:2368',
    key: 'e6135e8ac81739f26e7e72c03e'
};

export const restHandlers = [
    http.get('http://127.0.0.1:2368/ghost/api/content/posts/', () => {
        return HttpResponse.json(data);
    })
];

if (useMockApi) {
    const server = setupServer(...restHandlers);
    
    // Start server before all tests
    beforeAll(() => server.listen({onUnhandledRequest: 'error'}));
    
    //  Close server after all tests
    afterAll(() => server.close());
    
    // Reset handlers after each test `important for test isolation`
    afterEach(() => server.resetHandlers());
} else {
    // eslint-disable-next-line no-console
    console.log('Using live API');
}

const data = {
    posts: [{}],
    meta: {},
    body: {},
    headers: {},
    status: 200,
    response: {}
};

describe('api.posts', () => {
    it('has a browse method', async () => {
        const api = ghostContentApi(config);
        expect(api.posts.browse).toBeDefined();
    });

    describe('api.posts.browse', () => {
        it('returns posts', async () => {
            const api = ghostContentApi(config);
            const res = await api.posts.browse();
            expect(res.posts).toEqual(data.posts);
            expect(res.meta).toEqual(data.meta);
        });

        it('supports the include option as an array', () => {
            const api = ghostContentApi(config);
            const options = {
                include: ['authors', 'tags']
            };

            expect(() => api.posts.browse(options)).not.toThrow();
        });

        it('supports the include option as a string', () => {
            const api = ghostContentApi(config);
            const options = {
                include: 'authors,tags'
            };

            expect(() => api.posts.browse(options)).not.toThrow();
        });

        it('resolves with an array of the posts resources and includes a meta property on the array', async () => {
            const api = ghostContentApi(config);
            const res = await api.posts.browse();
            expect(res.posts).toEqual(data.posts);
            expect(res.meta).toEqual(data.meta);
        });
    });
});
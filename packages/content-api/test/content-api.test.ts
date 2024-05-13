import {describe, test, expect, vi} from 'vitest';
import ghostContentApi from '../lib/content-api';

// __version__ is replaced at compile time by the package version from package.json
declare const __version__: string;

describe('GhostContentApi', () => {
    const config = {
        url: 'https://ghost.local',
        key: '0123456789abcdef0123456789'
    };

    describe('Config', () => {
        test('Requires a config object with url and key', () => {
            // @ts-expect-error - Testing invalid input
            expect(() => ghostContentApi()).toThrowError(); 
            // @ts-expect-error - Testing invalid input
            expect(() => ghostContentApi({url: config.url})).toThrowError();
            // @ts-expect-error - Testing invalid input
            expect(() => ghostContentApi({key: config.key})).toThrowError();
            ghostContentApi(config);
        });

        test('Returns an api object with posts, tags, authors, pages, settings, tiers, newsletters, recommendations, and offers properties', () => {
            const api = ghostContentApi(config);

            expect(api).toHaveProperty('posts');
            expect(api).toHaveProperty('tags');
            expect(api).toHaveProperty('authors');
            expect(api).toHaveProperty('pages');
            expect(api).toHaveProperty('settings');
            expect(api).toHaveProperty('tiers');
            expect(api).toHaveProperty('newsletters');
            expect(api).toHaveProperty('recommendations');
            expect(api).toHaveProperty('offers');
            expect(api).not.toHaveProperty('settings.read');
            expect(api).not.toHaveProperty('tiers.read');
            expect(api).not.toHaveProperty('newsletters.read');
            expect(api).not.toHaveProperty('offers.browse');
            expect(api).not.toHaveProperty('recommendations.read');
        });
    });

    describe('makeApiRequest', () => {
        test('Can override makeRequest through constructor param', async () => {
            const makeRequestStub = vi.fn().mockResolvedValue({
                json: async () => ({
                    data: {
                        settings: {}
                    }
                })
            });

            const api = ghostContentApi({
                url: 'https://ghost.local',
                key: '0123456789abcdef0123456789',
                makeRequest: makeRequestStub
            });

            await api.settings.browse();

            expect(makeRequestStub).toHaveBeenCalledOnce();
            expect(makeRequestStub.mock.calls[0][0].options.key).toEqual('0123456789abcdef0123456789');
        });

        test('Adds Accept-Version header for v4, v5, canary, and no API versions', async () => {
            const makeRequestStub = vi.fn().mockResolvedValue({
                json: async () => ({
                    data: {
                        settings: {}
                    }
                })
            });

            const api = ghostContentApi({
                // @ts-expect-error - Testing invalid input
                version: 'canary',
                url: 'https://ghost.local',
                key: '0123456789abcdef0123456789',
                makeRequest: makeRequestStub
            });

            await api.settings.browse();
            
            expect(makeRequestStub).toHaveBeenCalledOnce();
            expect(makeRequestStub.mock.calls[0][0].url).toEqual('https://ghost.local/ghost/api/content/settings/');
            expect(makeRequestStub.mock.calls[0][0].headers.get('Accept-Version')).toEqual('v5.0');
            expect(makeRequestStub.mock.calls[0][0].headers.get('User-Agent')).toEqual(`GhostContentSDK/${__version__}`);
        });

        test('Adds "v5" Accept-Version header when parameter is provided', async () => {
            const makeRequestStub = vi.fn().mockResolvedValue({
                json: async () => ({
                    data: {
                        settings: {}
                    }
                })
            });

            const api = ghostContentApi({
                // @ts-expect-error - Testing compatible input
                version: 'v5.0',
                url: 'https://ghost.local',
                key: '0123456789abcdef0123456789',
                makeRequest: makeRequestStub
            });

            await api.settings.browse();
            
            expect(makeRequestStub).toHaveBeenCalledOnce();
            expect(makeRequestStub.mock.calls[0][0].url).toEqual('https://ghost.local/ghost/api/content/settings/');
            expect(makeRequestStub.mock.calls[0][0].headers.get('Accept-Version')).toEqual('v5.0');
            expect(makeRequestStub.mock.calls[0][0].headers.get('User-Agent')).toEqual(`GhostContentSDK/${__version__}`);
        });

        test('Adds Accept-Version header for v3 API', async () => {
            const makeRequestStub = vi.fn().mockResolvedValue({
                json: async () => ({
                    data: {
                        settings: {}
                    }
                })
            });

            const api = ghostContentApi({
                acceptVersionHeader: 'v3',
                url: 'https://ghost.local',
                key: '0123456789abcdef0123456789',
                makeRequest: makeRequestStub
            });

            await api.settings.browse();
            
            expect(makeRequestStub).toHaveBeenCalledOnce();
            expect(makeRequestStub.mock.calls[0][0].url).toEqual('https://ghost.local/ghost/api/content/settings/');
            expect(makeRequestStub.mock.calls[0][0].headers.get('Accept-Version')).toEqual('v3.0');
            expect(makeRequestStub.mock.calls[0][0].headers.get('User-Agent')).toEqual(`GhostContentSDK/${__version__}`);
        });

        test('Adds Accept-Version header for v3.6 API', async () => {
            const makeRequestStub = vi.fn().mockResolvedValue({
                json: async () => ({
                    data: {
                        settings: {}
                    }
                })
            });

            const api = ghostContentApi({
                acceptVersionHeader: 'v3.6',
                url: 'https://ghost.local',
                key: '0123456789abcdef0123456789',
                makeRequest: makeRequestStub
            });

            await api.settings.browse();
            
            expect(makeRequestStub).toHaveBeenCalledOnce();
            expect(makeRequestStub.mock.calls[0][0].url).toEqual('https://ghost.local/ghost/api/content/settings/');
            expect(makeRequestStub.mock.calls[0][0].headers.get('Accept-Version')).toEqual('v3.6');
            expect(makeRequestStub.mock.calls[0][0].headers.get('User-Agent')).toEqual(`GhostContentSDK/${__version__}`);
        });
        
        // Do we need to test for NOT adding the accept version header?

        test('Adds default Accept-Version header when not specified', async () => {
            const makeRequestStub = vi.fn().mockResolvedValue({
                json: async () => ({
                    data: {
                        settings: {}
                    }
                })
            });

            const api = ghostContentApi({
                url: 'https://ghost.local',
                key: '0123456789abcdef0123456789',
                makeRequest: makeRequestStub
            });

            await api.settings.browse();
            
            expect(makeRequestStub).toHaveBeenCalledOnce();
            expect(makeRequestStub.mock.calls[0][0].url).toEqual('https://ghost.local/ghost/api/content/settings/');
            expect(makeRequestStub.mock.calls[0][0].headers.get('Accept-Version')).toEqual('v5.0');
            expect(makeRequestStub.mock.calls[0][0].headers.get('User-Agent')).toEqual(`GhostContentSDK/${__version__}`);
        });

        test('Removes User-Agent header when set to "false"', async () => {
            const makeRequestStub = vi.fn().mockResolvedValue({
                json: async () => ({
                    data: {
                        settings: {}
                    }
                })
            });

            const api = ghostContentApi({
                url: 'https://ghost.local',
                key: '0123456789abcdef0123456789',
                makeRequest: makeRequestStub,
                userAgent: false
            });

            await api.settings.browse();

            expect(makeRequestStub).toHaveBeenCalledOnce();
            expect(makeRequestStub.mock.calls[0][0].url).toEqual('https://ghost.local/ghost/api/content/settings/');
            expect(makeRequestStub.mock.calls[0][0].headers.get('Accept-Version')).toEqual('v5.0');
            expect(makeRequestStub.mock.calls[0][0].headers.get('User-Agent')).toEqual(null);
        });

        test('Sets a custom User-Agent header', async () => {
            const makeRequestStub = vi.fn().mockResolvedValue({
                json: async () => ({
                    data: {
                        settings: {}
                    }
                })
            });

            const api = ghostContentApi({
                url: 'https://ghost.local',
                key: '0123456789abcdef0123456789',
                makeRequest: makeRequestStub,
                userAgent: 'I_LOVE_CUSTOM_THINGS'
            });

            await api.settings.browse();

            expect(makeRequestStub).toHaveBeenCalledOnce();
            expect(makeRequestStub.mock.calls[0][0].url).toEqual('https://ghost.local/ghost/api/content/settings/');
            expect(makeRequestStub.mock.calls[0][0].headers.get('Accept-Version')).toEqual('v5.0');
            expect(makeRequestStub.mock.calls[0][0].headers.get('User-Agent')).toEqual('I_LOVE_CUSTOM_THINGS');
        });
    });
});
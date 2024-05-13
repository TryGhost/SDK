import {validate, name} from '../lib/validate';
import {describe, test, expect, vi, afterAll} from 'vitest';

const baseConfig = {
    acceptVersionHeader: undefined,
    url: 'https://ghost.local',
    ghostPath: undefined,
    key: '0123456789abcdef0123456789',
    userAgent: undefined
};

describe('check input validation works', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    afterAll(() => {
        consoleWarnSpy.mockReset();
    });

    test('should return default accept version header when undefined', () => {
        const result = validate(baseConfig);
        expect(result.acceptVersionHeader).toBe('v5.0');
    });

    test('should return default accept version header when boolean', () => {
        const trueConfig = {...baseConfig, acceptVersionHeader: true};
        const falseConfig = {...baseConfig, acceptVersionHeader: false};
        // @ts-expect-error - Testing invalid input
        const trueResult = validate(trueConfig);
        // @ts-expect-error - Testing invalid input

        const falseResult = validate(falseConfig);

        expect(trueResult.acceptVersionHeader).toBe('v5.0');
        expect(falseResult.acceptVersionHeader).toBe('v5.0');
    });

    test('should throw error when accept version is not supported', () => {
        const config = {...baseConfig, acceptVersionHeader: 'v1.0'};
        expect(() => validate(config)).toThrow();
    });

    test('should throw error when accept version is in a deprecated format', () => {
        const config = {...baseConfig, acceptVersionHeader: 'canary'};
        const result = validate(config);
        expect(consoleWarnSpy).toHaveBeenCalled();
        expect(consoleWarnSpy).toHaveBeenCalledWith(`[${name}]: The version parameter, "canary," is deprecated. Please use "v{major}.{minor}" instead.`);
        expect(result.acceptVersionHeader).toBe('v5.0');
    });

    test('should throw error when accept version is in the wrong format', () => {
        const config = {...baseConfig, acceptVersionHeader: 'v3'};
        const result = validate(config);
        expect(consoleWarnSpy).toHaveBeenCalled();
        expect(consoleWarnSpy).toHaveBeenCalledWith(`[${name}]: The version parameter, "v{major}," is deprecated. Please use "v{major}.{minor}" instead.`);
        expect(result.acceptVersionHeader).toBe('v3.0');
    });

    test('should return supported version when supplied', () => {  
        const config = {...baseConfig, acceptVersionHeader: 'v3.6'};
        const result = validate(config);
        expect(result.acceptVersionHeader).toBe('v3.6');
    });

    test('should throw error when url is missing', () => {
        const config = {...baseConfig, url: ''};
        expect(() => validate(config)).toThrowError(`url`);
    });
    
    test('should throw error when protocol is missing', () => {
        const config = {...baseConfig, url: 'google.com'};
        expect(() => validate(config)).toThrowError('requires a protocol');
    });

    test('should throw error when url has trailing slash', () => {
        const config = {...baseConfig, url: 'https://google.com/'};
        expect(() => validate(config)).toThrowError('trailing slash');
    });

    test('show throw error when key is missing', () => {
        const config = {...baseConfig, key: ''};
        expect(() => validate(config)).toThrowError(`key`);
    });

    test('should throw error when ghostPath has a trailing slash', () => {
        const config = {...baseConfig, ghostPath: 'ghost/'};
        expect(() => validate(config)).toThrowError('trailing');
    });

    test('should throw error when ghostPath has a leading slash', () => {
        const config = {...baseConfig, ghostPath: '/ghost'};
        expect(() => validate(config)).toThrowError('leading');
    });

    test('should return undefined user agent when user agent is false', () => {
        const config = {...baseConfig, userAgent: false};
        const result = validate(config);
        expect(result.userAgent).toBe(undefined);
    });

    test('should return default user agent when user agent is undefined', () => {
        const result = validate(baseConfig);
        expect(result.userAgent).toBe(true);
    });

    test('should return the user agent when user agent is supplied', () => {
        const config = {...baseConfig, userAgent: 'test'};
        const result = validate(config);
        expect(result.userAgent).toBe('test');
    });
});

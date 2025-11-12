/* eslint-env node */
import typescript from '@rollup/plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import json from '@rollup/plugin-json';
import {terser} from 'rollup-plugin-terser';

function onwarn(warning, warn) {
    // Suppress circular dependency warnings from dependencies (htmlparser2, cheerio)
    // These are harmless warnings from third-party libraries, not our code
    if (warning.code === 'CIRCULAR_DEPENDENCY' && 
        (warning.message.includes('htmlparser2') || warning.message.includes('cheerio'))) {
        return;
    }
    // Use default for everything else
    warn(warning);
}

export default [
    // Node build.
    // No transpilation or bundling other than conversion from es modules to cjs
    {
        input: 'src/UrlUtils.ts',
        output: {
            file: 'cjs/UrlUtils.js',
            format: 'cjs',
            interop: false,
            exports: 'default'
        },
        external: ['lodash', 'cheerio', 'moment', 'moment-timezone', 'remark', 'remark-footnotes', 'unist-util-visit', 'url', 'events', 'string_decoder', 'buffer'],
        onwarn,
        plugins: [
            typescript(),
            commonjs({
                include: ['node_modules/**', '../../node_modules/**']
            })
        ]
    },

    // ES module build
    // Transpiles to es version supported by preset-env's default browsers list,
    // bundles all necessary dependencies and polyfills
    {
        input: 'src/UrlUtils.ts',
        output: [{
            file: 'es/UrlUtils.js',
            format: 'es',
            sourcemap: true
        }],
        external: ['lodash', 'cheerio', 'moment', 'moment-timezone', 'remark', 'remark-footnotes', 'unist-util-visit', 'url', 'events', 'string_decoder', 'buffer'],
        onwarn,
        plugins: [
            resolve({
                browser: true
            }),
            json(),
            typescript(),
            commonjs({
                include: ['node_modules/**', '../../node_modules/**']
            })
        ]
    },

    // Standalone UMD browser build (minified).
    // Transpiles to es version supported by preset-env's default browsers list,
    // bundles all dependencies and polyfills.
    // Note: Dependencies are external - browser users need to provide them
    {
        input: 'src/UrlUtils.ts',
        output: {
            file: 'umd/url-utils.min.js',
            format: 'umd',
            name: 'GhostUrlUtils',
            sourcemap: true,
            globals: {
                lodash: '_',
                cheerio: 'cheerio',
                moment: 'moment',
                'moment-timezone': 'moment',
                url: 'url',
                events: 'events',
                string_decoder: 'string_decoder',
                buffer: 'buffer'
            }
        },
        external: ['lodash', 'cheerio', 'moment', 'moment-timezone', 'remark', 'remark-footnotes', 'unist-util-visit', 'url', 'events', 'string_decoder', 'buffer'],
        onwarn,
        plugins: [
            resolve({
                browser: true
            }),
            json(),
            typescript(),
            commonjs({
                include: ['node_modules/**', '../../node_modules/**']
            }),
            terser()
        ]
    }
];

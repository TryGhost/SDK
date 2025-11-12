/* eslint-env node */
import typescript from '@rollup/plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import json from '@rollup/plugin-json';
import {terser} from 'rollup-plugin-terser';

export default [
    // Node build.
    // No transpilation or bundling other than conversion from es modules to cjs
    {
        input: 'src/UrlUtils.ts',
        output: {
            file: 'cjs/UrlUtils.js',
            format: 'cjs',
            interop: false
        },
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
    {
        input: 'src/UrlUtils.ts',
        output: {
            file: 'umd/url-utils.min.js',
            format: 'umd',
            name: 'GhostUrlUtils',
            sourcemap: true
        },
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


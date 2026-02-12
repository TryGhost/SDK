/* eslint-env node */
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import terser from '@rollup/plugin-terser';
import replace from 'rollup-plugin-replace';
import json from '@rollup/plugin-json';
import pkg from './package.json';
import nodePolyfills from 'rollup-plugin-polyfill-node';

const dependencies = Object.keys(pkg.dependencies);

export default [
    // Node build.
    // No transpilation or bundling other than converstion from es modules to cjs
    {
        input: pkg.source,
        output: {
            file: pkg.main,
            format: 'cjs',
            interop: false
        },
        plugins: [
            json(),
            commonjs({
                include: ['node_modules/**', '../../node_modules/**']
            })
        ],
        external: dependencies
    },

    // ES module build
    // Transpiles to es version supported by preset-env's default browsers list,
    // bundles all necessary dependencies and polyfills
    {
        input: pkg.source,
        output: [{
            file: pkg.module,
            format: 'es',
            sourcemap: true
        }],
        plugins: [
            json(),
            nodePolyfills(),
            resolve({
                browser: true
            }),
            commonjs({
                include: ['node_modules/**', '../../node_modules/**']
            }),
            babel({
                presets: [
                    ['@babel/preset-env', {
                        modules: false,
                        targets: 'defaults',
                        useBuiltIns: 'usage',
                        corejs: 3
                    }]
                ],
                exclude: ['node_modules/**', '../../node_modules/**']
            }),
            replace({
                'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
                'USER_AGENT_DEFAULT = true': `USER_AGENT_DEFAULT = false`
            })
        ]
    },

    // Standalone UMD browser build (minified).
    // Transpiles to es version supported by preset-env's default browsers list,
    // bundles all dependencies and polyfills.
    {
        input: pkg.source,
        output: {
            file: pkg['umd:main'],
            format: 'umd',
            name: 'GhostContentAPI',
            sourcemap: true
        },
        plugins: [
            json(),
            nodePolyfills(),
            resolve({
                browser: true
            }),
            commonjs({
                include: ['node_modules/**', '../../node_modules/**']
            }),
            babel({
                presets: [
                    ['@babel/preset-env', {
                        modules: false,
                        targets: 'defaults',
                        useBuiltIns: 'usage',
                        corejs: 3
                    }]
                ],
                exclude: ['node_modules/**', '../../node_modules/**']
            }),
            replace({
                'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
                'USER_AGENT_DEFAULT = true': `USER_AGENT_DEFAULT = false`
            }),
            terser()
        ]
    }
];

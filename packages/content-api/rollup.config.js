/* eslint-env node */
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import {terser} from 'rollup-plugin-terser';
import replace from 'rollup-plugin-replace';
import pkg from './package.json';

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
                        useBuiltIns: 'usage'
                    }]
                ],
                exclude: ['node_modules/**', '../../node_modules/**']
            }),
            replace({
                'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`
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
                        useBuiltIns: 'usage'
                    }]
                ],
                exclude: ['node_modules/**', '../../node_modules/**']
            }),
            replace({
                'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`
            }),
            terser()
        ]
    }
];

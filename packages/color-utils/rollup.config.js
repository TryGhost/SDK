/* eslint-env node */
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
// import {terser} from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';
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
            typescript(),
            commonjs({
                include: ['node_modules/**', '../../node_modules/**']
            })
        ],
        external: dependencies
    },

    // ES module build
    {
        input: pkg.source,
        output: [{
            file: pkg.module,
            format: 'es',
            sourcemap: true
        }],
        plugins: [
            typescript(),
            resolve({
                browser: true
            }),
            commonjs({
                include: ['node_modules/**', '../../node_modules/**']
            }),
            replace({
                'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`
            })
        ]
    },

    // Standalone UMD browser build (minified)
    {
        input: pkg.source,
        output: {
            file: pkg['umd:main'],
            format: 'umd',
            name: 'GhostContentAPI',
            sourcemap: true
        },
        plugins: [
            typescript(),
            resolve({
                browser: true
            }),
            commonjs({
                include: ['node_modules/**', '../../node_modules/**']
            }),
            replace({
                'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`
            })
            // terser()
        ]
    }
];

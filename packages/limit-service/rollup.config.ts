/* eslint-env node */
import typescript from '@rollup/plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import pkg from './package.json';

export default [
    // Node build
    {
        input: pkg.source,
        external: [/node_modules/],
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
        ]
    },

    // ES module build
    {
        input: pkg.source,
        external: [/node_modules/],
        output: [{
            file: pkg.module,
            format: 'es',
            sourcemap: true
        }],
        plugins: [
            resolve({
                browser: true
            }),
            typescript(),
            commonjs({
                include: ['node_modules/**', '../../node_modules/**']
            })
        ]
    }
];

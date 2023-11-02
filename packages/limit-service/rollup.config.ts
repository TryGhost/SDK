/* eslint-env node */
import {nodeResolve} from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default [
    // Node build
    {
        input: pkg.source,
        external: ['@tryghost/errors'],
        output: {
            file: pkg.main,
            format: 'cjs',
            interop: false,
            exports: 'default'
        },
        plugins: [
            nodeResolve({resolveOnly: ['date-fns']}),
            typescript(),
            commonjs({
                include: ['node_modules/**', '../../node_modules/**']
            })
        ]
    },

    // ES module build
    {
        input: pkg.source,
        external: ['@tryghost/errors'],
        output: [{
            file: pkg.module,
            format: 'es',
            sourcemap: true
        }],
        plugins: [
            nodeResolve({resolveOnly: ['date-fns']}),
            typescript(),
            commonjs({
                include: ['node_modules/**', '../../node_modules/**']
            })
        ]
    }
];

/* eslint-env node */
const typescript = require('@rollup/plugin-typescript');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const pkg = require('./package.json');

module.exports = [
    // Node build
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
        ]
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

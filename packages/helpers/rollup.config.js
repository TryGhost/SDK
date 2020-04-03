import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import {terser} from 'rollup-plugin-terser';
import pkg from './package.json';

const dependencies = Object.keys(pkg.dependencies);

export default [
    // Node build.
    // No transpilation but dependencies are bundled because we import ES modules.
    {
        input: pkg.source,
        output: {
            file: pkg.main,
            format: 'cjs'
        },
        plugins: [resolve()],
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
            })
        ]
    },

    // Standalone UMD browser build (minified)
    // Transpiles to es version supported by preset-env's default browsers list,
    // bundles all dependencies and polyfills.
    {
        input: pkg.source,
        output: [{
            file: pkg['umd:main'],
            format: 'umd',
            name: 'GhostHelpers',
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
                    ['@babel/preset-env',{
                        modules: false,
                        targets: 'defaults',
                        useBuiltIns: 'usage'
                    }]
                ],
                exclude: ['node_modules/**', '../../node_modules/**']
            }),
            terser()
        ]
    }
];

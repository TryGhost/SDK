import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import {terser} from 'rollup-plugin-terser';
import pkg from './package.json';

export default [
    // Node build.
    // No transpilation but dependencies are bundled because we import ES modules.
    {
        input: pkg.source,
        output: {
            file: pkg.main,
            format: 'cjs'
        },
        plugins: [
            resolve()
        ]
    },

    // Standalone UMD browser build (minified).
    // Transpiles to es5 and bundles all dependencies.
    {
        input: pkg.source,
        output: {
            file: pkg['umd:main'],
            format: 'umd',
            name: 'GhostHelpers'
        },
        plugins: [
            resolve({
                browser: true,
                preferBuiltins: false
            }),
            babel({
                exclude: ['node_modules/**', '../../node_modules/**']
            }),
            terser()
        ]
    }
];

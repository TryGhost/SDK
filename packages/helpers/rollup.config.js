import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import {terser} from 'rollup-plugin-terser';
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
        external: function(_id) {
            // don't warn about unresolved dependencies for module/* imports
            let id = _id.split('/')[0];
            return dependencies.includes(id);
        }
    },

    // Standalone UMD browser build (minified).
    // Transpiles to es5 and bundles all dependencies.
    {
        input: pkg.source,
        output: {
            file: pkg['umd:main'],
            format: 'umd',
            name: '@tryghost/helpers'
        },
        plugins: [
            resolve({
                browser: true,
                preferBuiltins: false
            }),
            babel({
                exclude: 'mode_modules/**'
            }),
            terser()
        ]
    }
];

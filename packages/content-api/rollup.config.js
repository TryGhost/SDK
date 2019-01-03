import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
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
        plugins: [
            commonjs({
                include: 'node_modules/**'
            })
        ]
	},

	// Standalone UMD browser build (minified).
	// Transpiles to es5 and bundles all dependencies.
	{
		input: pkg.source,
		output: {
			file: pkg['umd:main'],
			format: 'umd',
			name: '@tryghost/content-api'
		},
		plugins: [
			resolve({
				browser: true,
				preferBuiltins: false
			}),
            commonjs({
                include: 'node_modules/**'
            }),
			babel({
				exclude: 'mode_modules/**'
			}),
			terser()
		]
	}
];

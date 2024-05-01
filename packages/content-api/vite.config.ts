
/// <reference types="vitest" />
import {resolve} from 'node:path';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import packageJson from './package.json';

const packageName = packageJson.name.split('/').pop() || packageJson.name;

export default defineConfig({
    define: {
        __version__: JSON.stringify(packageJson.version)
    },
    build: {
        lib: {
            entry: resolve(__dirname, 'lib/content-api.ts'),
            name: packageName,
            fileName: format => `${packageName}.${format}.js`
        }
    },
    plugins: [
        dts({rollupTypes: true})
    ],
    test: {
        coverage: {
            provider: 'v8'
        }
    }
});
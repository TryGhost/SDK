import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'index.ts'),
      name: 'ReferrerParser',
      fileName: (format) => `index.${format === 'es' ? 'js' : format}`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: [],
    },
    sourcemap: true,
    minify: false
  },
  plugins: [
    dts({
      include: ['index.ts', 'lib/**/*.ts'],
      exclude: ['test', 'node_modules']
    })
  ],
  test: {
    globals: true,
    environment: 'node',
    include: ['./test/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['index.ts', 'lib/**/*.ts'],
      exclude: ['**/node_modules/**', '**/test/**', '**/*.d.ts']
    }
  }
}); 
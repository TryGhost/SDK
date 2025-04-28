import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['./test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['index.ts', 'lib/**/*.ts'],
      exclude: ['**/node_modules/**', '**/test/**', '**/*.d.ts']
    }
  }
}); 
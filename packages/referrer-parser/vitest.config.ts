import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['./test/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['index.ts', 'lib/**/*.ts'],
      exclude: ['**/node_modules/**', '**/test/**', '**/*.d.ts'],
      thresholds: {
        lines: 90
      }
    }
  }
}); 
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Pure logic runs in node; component tests opt in with `// @vitest-environment jsdom`.
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}', 'test/**/*.test.{ts,tsx}'],
    exclude: ['test/dist/**', 'node_modules/**'],
    setupFiles: ['./test/setup.ts'],
  },
});

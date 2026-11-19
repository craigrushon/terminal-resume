import { defineConfig } from 'vitest/config';

// Runs against the built site: `pnpm build && pnpm test:dist`.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/dist/**/*.test.ts'],
  },
});

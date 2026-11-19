// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/lib/site.ts';

export default defineConfig({
  site: SITE,
  integrations: [react(), sitemap()],
});

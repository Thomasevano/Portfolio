import { defineConfig } from 'astro/config';
import { remarkReadingTime } from './remark-reading-time.mjs';
import { unified } from '@astrojs/markdown-remark';

// https://astro.build/config
export default defineConfig({
  vite: {
    assetsInclude: ['**/*.base', '**/.obsidian/**', '**/_bases/**'],
    server: {
      watch: {
        ignored: ['**/.obsidian/**', '**/_bases/**'],
      },
    },
  },
  // Locales live in src/i18n/ui.ts; the [...lang] routes emit every one of them,
  // so no fallback routing is needed here.
  i18n: {
    defaultLocale: "fr",
    locales: ["en", "fr"],
  },
  markdown: {
    processor: unified({ remarkPlugins: [remarkReadingTime] }),
  },
  site: 'https://thomasevano.fr'
});

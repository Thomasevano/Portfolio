import { defineConfig } from 'astro/config';
import { remarkReadingTime } from './remark-reading-time.mjs';

// https://astro.build/config
export default defineConfig({
  i18n: {
    defaultLocale: "fr",
    locales: ["en", "fr"],
    fallback: {
      en: "fr",
    },
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true
    }
  },
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
  site: 'https://thomasevano.fr'
});

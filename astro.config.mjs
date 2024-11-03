import { defineConfig } from 'astro/config';

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
  }
});

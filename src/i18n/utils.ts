import { ui, defaultLang } from './ui';

export type Lang = keyof typeof ui;

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  }
}

/** Prefixes a path with its locale. The default locale stays unprefixed. */
export function localizePath(path: string, lang: Lang) {
  return lang === defaultLang ? path : `/${lang}${path}`;
}

/**
 * The `lang` param of a `[...lang]` route: `undefined` for the default
 * locale so the page renders at the root, the code itself otherwise.
 */
export function langParam(lang: Lang) {
  return lang === defaultLang ? undefined : lang;
}

/** One `getStaticPaths` entry per locale, for pages that exist in every language. */
export function localeRoutes() {
  return (Object.keys(ui) as Lang[]).map((lang) => ({
    params: { lang: langParam(lang) },
    props: { lang },
  }));
}

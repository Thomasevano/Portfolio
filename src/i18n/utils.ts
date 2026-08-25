import { defaultLang, languages, ui } from "./ui";

export type Lang = keyof typeof ui;
export const locales = Object.keys(ui) as Lang[];

const localePrefix = new RegExp(`^/(${locales.join("|")})(?=/|$)`);

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split("/");
  return lang in ui ? (lang as Lang) : defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}

/** Prefixes a path with its locale. The default locale stays unprefixed. */
export function localizePath(path: string, lang: Lang) {
  return lang === defaultLang ? path : `/${lang}${path}`;
}

/** Navigation choices for the same route in every configured locale. */
export function getLocaleLinks(url: URL) {
  const path = url.pathname.replace(localePrefix, "") || "/";
  return Object.entries(languages).map(([lang, label]) => ({
    lang: lang as Lang,
    label,
    href: localizePath(path, lang as Lang),
  }));
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
  return locales.map((lang) => ({
    params: { lang: langParam(lang) },
    props: { lang },
  }));
}

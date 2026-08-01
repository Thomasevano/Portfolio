import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { localeRoutes, localizePath, useTranslations } from "../../i18n/utils";
import { isPublished } from "../../lib/posts";

export const getStaticPaths = localeRoutes;

export async function GET(context) {
  const { lang } = context.props;
  const t = useTranslations(lang);

  const posts = await getCollection(
    "blogPosts",
    (post) => post.id.startsWith(`${lang}/`) && isPublished(post)
  );

  return rss({
    title: t("rss.title"),
    description: t("rss.description"),
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: localizePath(`/posts/${post.id.slice(lang.length + 1)}/`, lang),
    })),
    customData: `<language>${lang}</language>`,
  });
}

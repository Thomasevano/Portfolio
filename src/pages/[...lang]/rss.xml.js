import rss from "@astrojs/rss";
import { localeRoutes, localizePath, useTranslations } from "../../i18n/utils";
import { getPublishedPosts, postSlug } from "../../lib/posts";

export const getStaticPaths = localeRoutes;

export async function GET(context) {
  const { lang } = context.props;
  const t = useTranslations(lang);

  const posts = await getPublishedPosts(lang);

  return rss({
    title: t("rss.title"),
    description: t("rss.description"),
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: localizePath(`/posts/${postSlug(post)}/`, lang),
    })),
    customData: `<language>${lang}</language>`,
  });
}

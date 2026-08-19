import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  if (!context.site) {
    throw new Error(
      "`site` is missing in astro.config.mjs, the RSS feed requires it for absolute URLs",
    );
  }

  const posts = await getCollection("posts", ({ data }) => {
    return import.meta.env.DEV || data.published !== false;
  });

  return rss({
    title: "ezioleq",
    description: "Recent content on ezioleq",
    site: context.site,
    items: posts
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: `/posts/${post.id}/`,
      })),
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    customData: `
      <language>en-us</language>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <atom:link href="${new URL("index.xml", context.site)}" rel="self" type="application/rss+xml"/>
    `,
  });
}

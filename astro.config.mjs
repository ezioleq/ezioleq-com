import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

function remarkReadingTime() {
  return function (tree, file) {
    const textOnPage = typeof file.value === 'string' ? file.value : String(file.value);
    const words = textOnPage.split(/\s+/).filter(word => word.length > 0).length;
    const readingTime = Math.ceil(words / 200) || 1;
    if (file.data.astro) {
      if(!file.data.astro.frontmatter) file.data.astro.frontmatter = {};
      file.data.astro.frontmatter.wordCount = words;
      file.data.astro.frontmatter.readingTime = readingTime;
    }
  };
}

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  markdown: {
    remarkPlugins: [remarkReadingTime],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, {
        behavior: 'wrap',
        properties: {
          className: ['heading-link'],
          title: 'Copy link to clipboard',
        }
      }]
    ]
  }
});
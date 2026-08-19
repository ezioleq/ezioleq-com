import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { rehypeFigures } from './src/plugins/rehype-figures.js';

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
  site: 'https://ezioleq.com',
  integrations: [mdx()],
  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },
  markdown: {
    remarkPlugins: [remarkReadingTime],
    rehypePlugins: [
      rehypeSlug,
      rehypeFigures,
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
/**
 * Wrap content images in the same markup the <Figure> component emits, so that
 * native Markdown images (`![alt](./x.jpg)`) and explicit `<Figure>` usage look
 * and behave identically: same `figure.custom-figure` styling, clickable to open
 * the full-size file, and the Markdown `alt` shown as a `<figcaption>`.
 *
 * The inner <img> node is kept intact, so Astro's image optimization placeholder
 * (`__ASTRO_IMAGE_`) is preserved and the image is still optimized at render time.
 *
 * The click link is given no `href` here (the optimized URL isn't known yet at
 * rehype time); a small script in Layout.astro fills it from the rendered <img>.
 */

function meaningfulChildren(children) {
  return children.filter(
    (c) => !(c.type === 'text' && /^\s*$/.test(c.value))
  );
}

function paragraphIsSingleImage(children) {
  const m = meaningfulChildren(children);
  return (
    m.length === 1 && m[0].type === 'element' && m[0].tagName === 'img'
  );
}

function wrapInFigure(img) {
  const alt = typeof img.properties?.alt === 'string' ? img.properties.alt : '';
  const figure = {
    type: 'element',
    tagName: 'figure',
    properties: { className: ['custom-figure'] },
    children: [
      {
        type: 'element',
        tagName: 'a',
        properties: {
          className: ['figure-link'],
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        children: [img],
      },
    ],
  };
  if (alt) {
    figure.children.push({
      type: 'element',
      tagName: 'figcaption',
      properties: {},
      children: [{ type: 'text', value: alt }],
    });
  }
  return figure;
}

export function rehypeFigures() {
  return (tree) => {
    function walk(node) {
      if (!node || !Array.isArray(node.children)) return;
      const children = node.children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.type !== 'element') continue;

        // A paragraph containing only an image: lift the image out into a <figure>
        // so we don't produce invalid `<p><figure>...</figure></p>` markup.
        if (child.tagName === 'p' && paragraphIsSingleImage(child.children)) {
          const img = meaningfulChildren(child.children)[0];
          children[i] = wrapInFigure(img);
          continue;
        }

        walk(child);

        // A bare image not already nested in a <figure> or <a>: wrap it.
        if (
          child.tagName === 'img' &&
          node.tagName !== 'figure' &&
          node.tagName !== 'a'
        ) {
          children[i] = wrapInFigure(child);
        }
      }
    }
    walk(tree);
  };
}

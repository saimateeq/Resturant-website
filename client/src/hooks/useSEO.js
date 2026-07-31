import { useEffect } from 'react';

const SITE_NAME = 'Savoria';

function setMetaTag(name, content, attr = 'name') {
  if (!content) return;
  let tag = document.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export function useSEO({ title, description, image, type = 'website' }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Fine Dining Restaurant`;
    document.title = fullTitle;

    setMetaTag('description', description);
    setMetaTag('og:title', fullTitle, 'property');
    setMetaTag('og:description', description, 'property');
    setMetaTag('og:type', type, 'property');
    if (image) setMetaTag('og:image', image, 'property');
  }, [title, description, image, type]);
}

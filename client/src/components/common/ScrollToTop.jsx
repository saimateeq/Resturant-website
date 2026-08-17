import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Resets scroll position on every route change, since browsers only do this
// automatically for full page loads, not client-side navigation. A hash
// (e.g. the navbar's Gallery link) scrolls to that element instead of the
// top, matching normal anchor-link behavior.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // The target section can be behind a lazy-loaded route chunk and/or
      // its own data fetch (e.g. the gallery only renders once its dishes
      // load), so it may not exist in the DOM the instant this effect runs.
      // Poll briefly rather than giving up on the first miss.
      const id = hash.slice(1);
      let attempts = 0;
      let timeoutId;
      const tryScroll = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        attempts += 1;
        if (attempts < 20) timeoutId = setTimeout(tryScroll, 100);
      };
      tryScroll();
      return () => clearTimeout(timeoutId);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    return undefined;
  }, [pathname, hash]);

  return null;
}

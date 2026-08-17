import { useEffect, useRef, useState } from 'react';

// Frames loaded immediately at normal priority — just enough for the first
// screenful of scrolling. The remaining frames trickle in afterward instead
// of firing 180+ concurrent requests on page load, which used to account for
// several megabytes of eager network traffic before the user scrolled at all.
const PRIORITY_HEAD = 12;
const BACKGROUND_BATCH_SIZE = 8;
const BACKGROUND_BATCH_DELAY_MS = 60;
// On a metered/slow connection, batches are spaced out much further apart so
// the rest of the sequence stops competing with content the user actually
// asked for. Still loads eventually (getNearestLoadedFrame degrades to a
// chunkier scrub in the meantime) rather than never finishing.
const SLOW_CONNECTION_BATCH_DELAY_MS = 1200;

function isDataConstrained() {
  const conn =
    (typeof navigator !== 'undefined' &&
      (navigator.connection || navigator.mozConnection || navigator.webkitConnection)) ||
    null;
  if (!conn) return false;
  return Boolean(conn.saveData) || ['slow-2g', '2g'].includes(conn.effectiveType);
}

/**
 * Preloads an ordered list of image URLs and exposes the closest already-loaded
 * frame for any requested index, so a scroll-scrubbed sequence never draws a
 * blank frame while later images are still downloading.
 */
export function useFrameSequence(urls) {
  const [loadedCount, setLoadedCount] = useState(0);
  const imagesRef = useRef([]);

  useEffect(() => {
    if (!urls.length) return undefined;

    let cancelled = false;
    imagesRef.current = new Array(urls.length).fill(null);
    setLoadedCount(0);

    const loadOne = (src, index, priority) => {
      const img = new Image();
      img.decoding = 'async';
      if ('fetchPriority' in img) img.fetchPriority = priority;
      const settle = () => {
        if (cancelled) return;
        imagesRef.current[index] = img;
        setLoadedCount((count) => count + 1);
      };
      img.onload = settle;
      img.onerror = settle; // don't let one bad frame stall the whole sequence
      img.src = src;
    };

    urls.slice(0, PRIORITY_HEAD).forEach((src, i) => loadOne(src, i, 'high'));

    const batchDelay = isDataConstrained() ? SLOW_CONNECTION_BATCH_DELAY_MS : BACKGROUND_BATCH_DELAY_MS;
    let batchIndex = 0;
    const loadNextBackgroundBatch = () => {
      if (cancelled) return;
      const start = PRIORITY_HEAD + batchIndex * BACKGROUND_BATCH_SIZE;
      const batch = urls.slice(start, start + BACKGROUND_BATCH_SIZE);
      if (!batch.length) return;
      batch.forEach((src, i) => loadOne(src, start + i, 'low'));
      batchIndex += 1;
      setTimeout(loadNextBackgroundBatch, batchDelay);
    };
    loadNextBackgroundBatch();

    return () => {
      cancelled = true;
    };
  }, [urls]);

  const getNearestLoadedFrame = (index) => {
    const images = imagesRef.current;
    if (!images.length) return null;
    const clamped = Math.max(0, Math.min(index, images.length - 1));
    for (let i = clamped; i >= 0; i -= 1) {
      if (images[i]) return images[i];
    }
    for (let i = clamped; i < images.length; i += 1) {
      if (images[i]) return images[i];
    }
    return null;
  };

  return {
    total: urls.length,
    loadedCount,
    isReady: urls.length > 0 && loadedCount >= urls.length,
    // True once just the priority head has loaded — enough for a smooth
    // start to scrolling. Gate the "start scrolling" UI on this rather than
    // on full completion, since the rest of the sequence now loads in the
    // background over a longer window by design (see PRIORITY_HEAD above).
    isHeadReady: urls.length > 0 && loadedCount >= Math.min(PRIORITY_HEAD, urls.length),
    progress: urls.length ? loadedCount / urls.length : 0,
    getNearestLoadedFrame,
  };
}

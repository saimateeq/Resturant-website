import { useEffect, useRef, useState } from 'react';

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

    urls.forEach((src, index) => {
      const img = new Image();
      img.decoding = 'async';
      const settle = () => {
        if (cancelled) return;
        imagesRef.current[index] = img;
        setLoadedCount((count) => count + 1);
      };
      img.onload = settle;
      img.onerror = settle; // don't let one bad frame stall the whole sequence
      img.src = src;
    });

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
    progress: urls.length ? loadedCount / urls.length : 0,
    getNearestLoadedFrame,
  };
}

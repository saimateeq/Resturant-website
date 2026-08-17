import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import cn from '@utils/cn';

// Cycle of grid spans applied in order to break the grid into an editorial
// mix of large/small/portrait/wide tiles instead of a uniform grid.
const SPAN_PATTERN = [
  'sm:col-span-2 sm:row-span-2',
  'sm:col-span-1 sm:row-span-1',
  'sm:col-span-1 sm:row-span-2',
  'sm:col-span-2 sm:row-span-1',
  'sm:col-span-1 sm:row-span-1',
  'sm:col-span-1 sm:row-span-1',
];

// Shared by the home page's gallery teaser and the dedicated /gallery page —
// an asymmetric masonry grid of `images` ({ url, name }[]) with a lightbox.
export default function MasonryGallery({ images }) {
  const [openIndex, setOpenIndex] = useState(-1);

  useEffect(() => {
    if (openIndex < 0) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpenIndex(-1);
      if (e.key === 'ArrowRight') setOpenIndex((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setOpenIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [openIndex, images.length]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:auto-rows-[160px] sm:grid-cols-4 sm:gap-5">
        {images.map((img, i) => (
          <motion.button
            type="button"
            key={img.url}
            onClick={() => setOpenIndex(i)}
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: (i % 8) * 0.05, duration: 0.4 }}
            className={cn(
              'group relative aspect-square overflow-hidden text-left sm:aspect-auto',
              SPAN_PATTERN[i % SPAN_PATTERN.length],
            )}
          >
            <img
              src={img.url}
              alt={img.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors duration-300 group-hover:bg-ink/40">
              <span className="font-body text-xs font-semibold tracking-[0.2em] text-cream uppercase opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                View
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {openIndex >= 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 p-4 sm:p-10"
            role="dialog"
            aria-modal="true"
            aria-label="Gallery image"
            onClick={() => setOpenIndex(-1)}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(-1)}
              aria-label="Close"
              className="absolute top-6 right-6 flex h-11 w-11 items-center justify-center rounded-full text-cream/80 transition-colors hover:bg-cream/10 hover:text-cream"
            >
              <FiX size={22} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenIndex((i) => (i - 1 + images.length) % images.length);
              }}
              aria-label="Previous image"
              className="absolute left-2 flex h-11 w-11 items-center justify-center rounded-full text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream sm:left-6"
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenIndex((i) => (i + 1) % images.length);
              }}
              aria-label="Next image"
              className="absolute right-2 flex h-11 w-11 items-center justify-center rounded-full text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream sm:right-6"
            >
              <FiChevronRight size={24} />
            </button>

            <motion.img
              key={images[openIndex].url}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={images[openIndex].url}
              alt={images[openIndex].name}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[80vh] max-w-full object-contain"
            />
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 font-body text-xs tracking-[0.1em] text-cream/60 uppercase">
              {images[openIndex].name}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

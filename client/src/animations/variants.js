export const fadeInUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// Slow, editorial image entrance — a slight zoom-out paired with a clip-path
// inset that opens up, rather than a plain fade. Used for the large
// photography in the redesigned marketing sections.
export const imageReveal = {
  hidden: { opacity: 0, scale: 1.08, clipPath: 'inset(6%)' },
  visible: {
    opacity: 1,
    scale: 1,
    clipPath: 'inset(0%)',
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

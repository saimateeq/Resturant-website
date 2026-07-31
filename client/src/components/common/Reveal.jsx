import { motion } from 'framer-motion';
import { fadeInUp } from '@animations/variants';

export default function Reveal({ children, variants = fadeInUp, className = '', delay = 0 }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={variants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

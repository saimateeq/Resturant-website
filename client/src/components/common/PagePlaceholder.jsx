import { motion } from 'framer-motion';

export default function PagePlaceholder({ title, description }) {
  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-4xl font-bold text-secondary-900 dark:text-secondary-50"
      >
        {title}
      </motion.h1>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-4 max-w-xl text-secondary-500 dark:text-secondary-400"
        >
          {description}
        </motion.p>
      )}
      <span className="mt-6 rounded-full bg-primary-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary-600 uppercase dark:text-primary-400">
        Coming in a later phase
      </span>
    </div>
  );
}

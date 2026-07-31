import { AnimatePresence, motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const maxWidth = size === 'lg' ? 'max-w-2xl' : size === 'sm' ? 'max-w-sm' : 'max-w-lg';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className={`max-h-[90vh] w-full ${maxWidth} overflow-y-auto rounded-2xl bg-white p-6 dark:bg-secondary-900`}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-secondary-900 dark:text-secondary-50">
                {title}
              </h2>
              <button onClick={onClose} aria-label="Close dialog" className="text-secondary-400 hover:text-secondary-600">
                <FiX size={20} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

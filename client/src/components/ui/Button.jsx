import { motion } from 'framer-motion';
import cn from '@utils/cn';

const variants = {
  primary: 'btn-gradient',
  outline:
    'border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-500/10',
  ghost: 'text-secondary-700 dark:text-secondary-200 hover:bg-secondary-500/10',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium cursor-pointer transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

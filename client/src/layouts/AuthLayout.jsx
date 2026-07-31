import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from '@components/layout/ThemeToggle';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary-50 px-4 dark:bg-secondary-950">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-3xl border border-secondary-500/10 bg-white p-8 shadow-soft dark:bg-secondary-900"
      >
        <Link to="/" className="font-display block text-center text-3xl font-bold text-primary-600 dark:text-primary-400">
          Savoria
        </Link>
        <div className="mt-8">
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
}

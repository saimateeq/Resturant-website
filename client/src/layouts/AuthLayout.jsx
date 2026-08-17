import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <Link
        to="/"
        aria-label="Back to home"
        title="Back to home"
        className="absolute top-6 left-6 flex h-10 w-10 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-ink/5"
      >
        <FiArrowLeft size={18} />
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md border border-ink/10 bg-cream p-8 sm:p-10"
      >
        <Link to="/" className="font-display block text-center text-3xl text-ink italic">
          Savoria
        </Link>
        <div className="mt-8">
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCalendar } from 'react-icons/fi';

export default function Hero() {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-secondary-950">
      <img
        src="https://loremflickr.com/1600/900/restaurant,finedining?lock=hero"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-primary-900)_0%,_var(--color-secondary-950)_60%)] opacity-80" />
      <motion.div
        aria-hidden
        initial={{ scale: 1.1, opacity: 0.4 }}
        animate={{ scale: 1, opacity: 0.6 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDgiLz48L2c+PC9zdmc+')] bg-repeat"
      />

      <div className="container-app relative z-10 flex flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="rounded-full border border-primary-400/30 bg-primary-500/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-primary-300 uppercase"
        >
          Fine Dining Since 2010
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-6 font-display text-5xl font-bold text-white sm:text-6xl lg:text-7xl"
        >
          Taste the Art of
          <br />
          <span className="text-primary-400">Fine Dining</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-6 max-w-xl text-lg text-secondary-300"
        >
          Savoria brings together seasonal ingredients, bold flavors, and warm hospitality for an
          unforgettable dining experience.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <Link
            to="/menu"
            className="btn-gradient flex items-center justify-center gap-2 rounded-full px-8 py-4 font-medium"
          >
            Order Now <FiArrowRight />
          </Link>
          <Link
            to="/reservations"
            className="flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-4 font-medium text-white transition-colors hover:bg-white/10"
          >
            <FiCalendar /> Reserve a Table
          </Link>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 h-10 w-6 -translate-x-1/2 rounded-full border-2 border-white/30"
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mx-auto mt-2 h-2 w-1 rounded-full bg-white/60"
        />
      </motion.div>
    </section>
  );
}

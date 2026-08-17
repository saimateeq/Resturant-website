import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiShoppingBag, FiUser, FiLogOut } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { useAuth } from '@hooks/useAuth';
import cn from '@utils/cn';
import { USER_ROLES } from '@constants';

const ADMIN_ROLES = [USER_ROLES.ADMIN, USER_ROLES.MANAGER];

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/about', label: 'Our Story' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/blog', label: 'Journal' },
];

const drawerLink = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.06 * i, ease: 'easeOut' } }),
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const cartCount = useSelector((state) => state.cart.items.length);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const role = useSelector((state) => state.auth.user?.role);
  const isAdmin = ADMIN_ROLES.includes(role);
  const accountLink = isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/login';
  const { logout } = useAuth();

  // Transparent-over-hero only makes sense on the home page, where the hero
  // is full-bleed dark footage the whole way through its scroll. Every other
  // route starts with a plain light page, so the nav is solid from the start.
  const isHome = location.pathname === '/';
  const transparent = isHome && !scrolled;

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return undefined;
    }
    setScrolled(window.scrollY > 40);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  useEffect(() => {
    if (isOpen) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const linkTone = transparent ? 'text-cream/80 hover:text-white' : 'text-ink/70 hover:text-ink';
  const activeTone = transparent ? 'text-white' : 'text-ink';
  const iconTone = transparent
    ? 'text-cream/80 hover:bg-white/10 hover:text-white'
    : 'text-ink/70 hover:bg-ink/5 hover:text-ink';

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-colors duration-500',
          transparent ? 'border-b border-transparent bg-transparent' : 'border-b border-ink/10 bg-cream/95 backdrop-blur-sm',
        )}
      >
      <nav className="container-app flex h-20 items-center justify-between">
        <Link
          to="/"
          className={cn(
            'font-display text-2xl font-semibold tracking-[0.08em] transition-colors duration-500',
            transparent ? 'text-white' : 'text-ink',
          )}
        >
          SAVORIA
        </Link>

        <ul className="hidden items-center gap-10 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <li key={link.to} className="relative">
                <NavLink
                  to={link.to}
                  className={cn(
                    'font-body text-[13px] font-medium tracking-[0.04em] uppercase transition-colors duration-300',
                    isActive ? activeTone : linkTone,
                  )}
                >
                  {link.label}
                </NavLink>
                {isActive && (
                  <motion.span
                    layoutId="nav-active-indicator"
                    className={cn('absolute -bottom-2 left-0 h-px w-full', transparent ? 'bg-white' : 'bg-gold')}
                  />
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1.5">
          <Link
            to="/cart"
            aria-label="Cart"
            className={cn(
              'relative hidden h-10 w-10 items-center justify-center rounded-full transition-colors sm:flex',
              iconTone,
            )}
          >
            <FiShoppingBag size={17} />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-ink">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            to={accountLink}
            aria-label={isAdmin ? 'Admin Panel' : 'Account'}
            title={isAdmin ? 'Admin Panel' : 'Account'}
            className={cn('hidden h-10 w-10 items-center justify-center rounded-full transition-colors sm:flex', iconTone)}
          >
            <FiUser size={17} />
          </Link>
          {isAuthenticated && (
            <button
              type="button"
              onClick={logout}
              aria-label="Logout"
              title="Logout"
              className={cn('hidden h-10 w-10 items-center justify-center rounded-full transition-colors sm:flex', iconTone)}
            >
              <FiLogOut size={17} />
            </button>
          )}

          <Link
            to="/reservations"
            className={cn(
              'ml-3 hidden items-center border px-6 py-2.5 font-body text-[12px] font-semibold tracking-[0.1em] uppercase transition-colors duration-300 md:inline-flex',
              transparent
                ? 'border-white/70 text-white hover:bg-white hover:text-ink'
                : 'border-ink bg-ink text-cream hover:bg-espresso',
            )}
          >
            Reserve a Table
          </Link>

          <button
            type="button"
            className={cn('flex h-10 w-10 items-center justify-center rounded-full transition-colors lg:hidden', iconTone)}
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
          >
            <FiMenu size={20} />
          </button>
        </div>
      </nav>
      </header>

      {/* Portalled to <body> rather than nested in <header> — the header's
          own backdrop-blur (applied whenever it's in its solid state, which
          is always true on every non-home route) creates a new CSS
          containing block for position:fixed descendants, which silently
          collapsed this drawer's fixed inset-y-0 to the header's own ~80px
          box instead of the viewport. */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-40 bg-ink/60 lg:hidden"
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
              />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-sm flex-col bg-cream px-8 py-6 lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-xl font-semibold tracking-[0.08em] text-ink">SAVORIA</span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close menu"
                  className="flex h-11 w-11 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-ink/5"
                >
                  <FiX size={22} />
                </button>
              </div>

              <ul className="mt-12 flex flex-col gap-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link.to}
                    custom={i}
                    variants={drawerLink}
                    initial="hidden"
                    animate="visible"
                    className="border-b border-ink/10"
                  >
                    <NavLink
                      to={link.to}
                      onClick={() => setIsOpen(false)}
                      className="block py-4 font-display text-3xl font-medium text-ink"
                    >
                      {link.label}
                    </NavLink>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-auto flex flex-col gap-4">
                <Link
                  to="/reservations"
                  onClick={() => setIsOpen(false)}
                  className="flex min-h-[44px] items-center justify-center bg-ink px-6 py-3.5 text-center font-body text-[12px] font-semibold tracking-[0.1em] text-cream uppercase"
                >
                  Reserve a Table
                </Link>

                <div className="flex items-center justify-center gap-6 pt-2">
                  <Link
                    to="/cart"
                    onClick={() => setIsOpen(false)}
                    className="flex min-h-[44px] items-center gap-2 text-sm font-medium text-ink/70"
                  >
                    <FiShoppingBag size={16} /> Cart{cartCount > 0 ? ` (${cartCount})` : ''}
                  </Link>
                  <Link
                    to={accountLink}
                    onClick={() => setIsOpen(false)}
                    className="flex min-h-[44px] items-center gap-2 text-sm font-medium text-ink/70"
                  >
                    <FiUser size={16} /> {isAdmin ? 'Admin' : 'Account'}
                  </Link>
                  {isAuthenticated && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        logout();
                      }}
                      className="flex min-h-[44px] items-center gap-2 text-sm font-medium text-ink/70"
                    >
                      <FiLogOut size={16} /> Logout
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

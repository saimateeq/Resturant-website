import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiShoppingBag, FiUser, FiLogOut } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { useAuth } from '@hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import cn from '@utils/cn';
import { USER_ROLES } from '@constants';

const ADMIN_ROLES = [USER_ROLES.ADMIN, USER_ROLES.MANAGER];

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/about', label: 'About' },
  { to: '/reservations', label: 'Reservations' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const cartCount = useSelector((state) => state.cart.items.length);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const role = useSelector((state) => state.auth.user?.role);
  const isAdmin = ADMIN_ROLES.includes(role);
  const accountLink = isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/login';
  const { logout } = useAuth();

  return (
    <header className="glass sticky top-0 z-50 w-full">
      <nav className="container-app flex h-18 items-center justify-between py-3">
        <Link to="/" className="font-display text-2xl font-bold text-primary-600 dark:text-primary-400">
          Savoria
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'text-sm font-medium transition-colors hover:text-primary-500',
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-secondary-700 dark:text-secondary-200',
                  )
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/cart"
            aria-label="Cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-secondary-700 transition-colors hover:bg-secondary-500/10 dark:text-secondary-200"
          >
            <FiShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            to={accountLink}
            aria-label={isAdmin ? 'Admin Panel' : 'Account'}
            title={isAdmin ? 'Admin Panel' : 'Account'}
            className="hidden h-10 w-10 items-center justify-center rounded-full text-secondary-700 transition-colors hover:bg-secondary-500/10 sm:flex dark:text-secondary-200"
          >
            <FiUser size={18} />
          </Link>
          {isAuthenticated && (
            <button
              type="button"
              onClick={logout}
              aria-label="Logout"
              title="Logout"
              className="hidden h-10 w-10 items-center justify-center rounded-full text-secondary-700 transition-colors hover:bg-red-500/10 hover:text-red-500 sm:flex dark:text-secondary-200"
            >
              <FiLogOut size={18} />
            </button>
          )}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-secondary-700 lg:hidden dark:text-secondary-200"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden lg:hidden"
          >
            {NAV_LINKS.map((link) => (
              <li key={link.to} className="border-t border-secondary-500/10">
                <NavLink
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className="block px-6 py-3 text-sm font-medium text-secondary-700 dark:text-secondary-200"
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            {isAuthenticated ? (
              <li className="border-t border-secondary-500/10">
                <NavLink
                  to={accountLink}
                  onClick={() => setIsOpen(false)}
                  className="block px-6 py-3 text-sm font-medium text-secondary-700 dark:text-secondary-200"
                >
                  {isAdmin ? 'Admin Panel' : 'My Account'}
                </NavLink>
              </li>
            ) : (
              <>
                <li className="border-t border-secondary-500/10">
                  <NavLink
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-6 py-3 text-sm font-medium text-secondary-700 dark:text-secondary-200"
                  >
                    Login
                  </NavLink>
                </li>
                <li className="border-t border-secondary-500/10">
                  <NavLink
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="block px-6 py-3 text-sm font-medium text-secondary-700 dark:text-secondary-200"
                  >
                    Register
                  </NavLink>
                </li>
              </>
            )}
            {isAuthenticated && (
              <li className="border-t border-secondary-500/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2 px-6 py-3 text-sm font-medium text-red-500"
                >
                  <FiLogOut size={16} /> Logout
                </button>
              </li>
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}

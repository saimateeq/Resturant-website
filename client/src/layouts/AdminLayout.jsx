import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  FiGrid,
  FiBook,
  FiShoppingCart,
  FiCalendar,
  FiUsers,
  FiUserCheck,
  FiPackage,
  FiTag,
  FiStar,
  FiFileText,
  FiMenu,
  FiX,
  FiLogOut,
  FiExternalLink,
} from 'react-icons/fi';
import { useAuth } from '@hooks/useAuth';
import ThemeToggle from '@components/layout/ThemeToggle';
import cn from '@utils/cn';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/menu', label: 'Menu', icon: FiBook },
  { to: '/admin/orders', label: 'Orders', icon: FiShoppingCart },
  { to: '/admin/reservations', label: 'Reservations', icon: FiCalendar },
  { to: '/admin/customers', label: 'Customers', icon: FiUsers },
  { to: '/admin/staff', label: 'Staff', icon: FiUserCheck },
  { to: '/admin/inventory', label: 'Inventory', icon: FiPackage },
  { to: '/admin/coupons', label: 'Coupons', icon: FiTag },
  { to: '/admin/reviews', label: 'Reviews', icon: FiStar },
  { to: '/admin/blog', label: 'Blog', icon: FiFileText },
];

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-secondary-50 dark:bg-secondary-950">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform border-r border-secondary-500/10 bg-white transition-transform duration-300 lg:static lg:translate-x-0 dark:bg-secondary-900',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <span className="font-display text-xl font-bold text-primary-600 dark:text-primary-400">
            Savoria Admin
          </span>
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)} aria-label="Close sidebar">
            <FiX size={20} />
          </button>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {ADMIN_LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                    : 'text-secondary-600 hover:bg-secondary-500/10 dark:text-secondary-300',
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 lg:ml-0">
        <header className="flex h-16 items-center justify-between border-b border-secondary-500/10 bg-white px-6 dark:bg-secondary-900">
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(true)} aria-label="Open sidebar">
            <FiMenu size={20} />
          </button>
          <div className="ml-auto flex items-center gap-4">
            {user?.name && (
              <span className="hidden text-sm font-medium text-secondary-600 sm:block dark:text-secondary-300">
                {user.name}
              </span>
            )}
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View site"
              title="View site"
              className="flex h-10 w-10 items-center justify-center rounded-full text-secondary-700 transition-colors hover:bg-secondary-500/10 dark:text-secondary-200"
            >
              <FiExternalLink size={18} />
            </Link>
            <ThemeToggle />
            <button
              type="button"
              onClick={logout}
              aria-label="Logout"
              title="Logout"
              className="flex h-10 w-10 items-center justify-center rounded-full text-secondary-700 transition-colors hover:bg-red-500/10 hover:text-red-500 dark:text-secondary-200"
            >
              <FiLogOut size={18} />
            </button>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

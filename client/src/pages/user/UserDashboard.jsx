import { lazy, Suspense } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import {
  FiGrid,
  FiUser,
  FiShoppingBag,
  FiCalendar,
  FiHeart,
  FiMapPin,
  FiBell,
  FiSettings,
} from 'react-icons/fi';
import cn from '@utils/cn';
import Loader from '@components/common/Loader';

const DashboardOverview = lazy(() => import('./dashboard/DashboardOverview'));
const Profile = lazy(() => import('./dashboard/Profile'));
const MyOrders = lazy(() => import('./dashboard/MyOrders'));
const MyReservations = lazy(() => import('./dashboard/MyReservations'));
const Wishlist = lazy(() => import('./dashboard/Wishlist'));
const Addresses = lazy(() => import('./dashboard/Addresses'));
const Notifications = lazy(() => import('./dashboard/Notifications'));
const Settings = lazy(() => import('./dashboard/Settings'));

const NAV_LINKS = [
  { to: '/dashboard', label: 'Overview', icon: FiGrid, end: true },
  { to: '/dashboard/profile', label: 'Profile', icon: FiUser },
  { to: '/dashboard/orders', label: 'My Orders', icon: FiShoppingBag },
  { to: '/dashboard/reservations', label: 'Reservations', icon: FiCalendar },
  { to: '/dashboard/wishlist', label: 'Wishlist', icon: FiHeart },
  { to: '/dashboard/addresses', label: 'Addresses', icon: FiMapPin },
  { to: '/dashboard/notifications', label: 'Notifications', icon: FiBell },
  { to: '/dashboard/settings', label: 'Settings', icon: FiSettings },
];

export default function UserDashboard() {
  return (
    <div className="container-app grid grid-cols-1 gap-8 py-12 lg:grid-cols-[240px_1fr]">
      <aside className="h-fit rounded-2xl border border-secondary-500/10 bg-white p-3 dark:bg-secondary-900 lg:sticky lg:top-24">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {NAV_LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                    : 'text-secondary-600 hover:bg-secondary-500/10 dark:text-secondary-300',
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="reservations" element={<MyReservations />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

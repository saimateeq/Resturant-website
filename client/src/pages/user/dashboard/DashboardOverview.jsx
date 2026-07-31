import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiShoppingBag, FiCalendar, FiAward, FiHeart } from 'react-icons/fi';
import { orderService } from '@services/orderService';
import { reservationService } from '@services/reservationService';
import { ORDER_STATUS } from '@constants';
import cn from '@utils/cn';

const STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: 'bg-amber-500/10 text-amber-600',
  [ORDER_STATUS.ACCEPTED]: 'bg-blue-500/10 text-blue-600',
  [ORDER_STATUS.PREPARING]: 'bg-blue-500/10 text-blue-600',
  [ORDER_STATUS.READY]: 'bg-purple-500/10 text-purple-600',
  [ORDER_STATUS.DELIVERED]: 'bg-green-500/10 text-green-600',
  [ORDER_STATUS.CANCELLED]: 'bg-red-500/10 text-red-600',
  [ORDER_STATUS.REFUNDED]: 'bg-red-500/10 text-red-600',
};

export default function DashboardOverview() {
  const user = useSelector((state) => state.auth.user);
  const wishlistCount = useSelector((state) => state.wishlist.ids.length);
  const [orders, setOrders] = useState([]);
  const [upcomingReservation, setUpcomingReservation] = useState(null);

  useEffect(() => {
    orderService.getMyOrders().then(({ data }) => setOrders(data.data.orders.slice(0, 5)));
    reservationService.getMyReservations().then(({ data }) => {
      const upcoming = data.data.reservations
        .filter((r) => r.status === 'approved' && new Date(r.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
      setUpcomingReservation(upcoming);
    });
  }, []);

  const stats = [
    { label: 'Orders', value: orders.length, icon: FiShoppingBag },
    { label: 'Reward Points', value: user?.rewardPoints || 0, icon: FiAward },
    { label: 'Wishlist Items', value: wishlistCount, icon: FiHeart },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50">
        Welcome back, {user?.name?.split(' ')[0]}
      </h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-secondary-500/10 bg-white p-5 dark:bg-secondary-900"
          >
            <stat.icon className="text-primary-500" size={20} />
            <p className="mt-2 text-2xl font-bold text-secondary-900 dark:text-secondary-50">{stat.value}</p>
            <p className="text-sm text-secondary-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {upcomingReservation && (
        <div className="mt-6 flex items-center gap-4 rounded-2xl bg-primary-500/10 p-5">
          <FiCalendar className="text-primary-600" size={24} />
          <div>
            <p className="font-medium text-secondary-900 dark:text-secondary-50">Upcoming reservation</p>
            <p className="text-sm text-secondary-600 dark:text-secondary-300">
              {new Date(upcomingReservation.date).toDateString()} at {upcomingReservation.time} for{' '}
              {upcomingReservation.guests} guests
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-secondary-500/10 bg-white p-6 dark:bg-secondary-900">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-secondary-900 dark:text-secondary-50">
            Recent Orders
          </h2>
          <Link to="/dashboard/orders" className="text-sm text-primary-600 dark:text-primary-400">
            View all
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {orders.length === 0 && <p className="text-sm text-secondary-500">No orders yet.</p>}
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="flex items-center justify-between rounded-xl border border-secondary-500/10 p-3 text-sm"
            >
              <span className="font-medium text-secondary-900 dark:text-secondary-50">
                #{order.orderNumber}
              </span>
              <span className={cn('rounded-full px-3 py-1 text-xs font-medium capitalize', STATUS_COLORS[order.status])}>
                {order.status}
              </span>
              <span className="font-semibold text-secondary-900 dark:text-secondary-50">
                ${order.total.toFixed(2)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import cn from '@utils/cn';
import { orderService } from '@services/orderService';
import Loader from '@components/common/Loader';

const STATUS_COLORS = {
  pending: 'bg-amber-500/10 text-amber-600',
  accepted: 'bg-blue-500/10 text-blue-600',
  preparing: 'bg-blue-500/10 text-blue-600',
  ready: 'bg-purple-500/10 text-purple-600',
  delivered: 'bg-green-500/10 text-green-600',
  cancelled: 'bg-red-500/10 text-red-600',
  refunded: 'bg-red-500/10 text-red-600',
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .getMyOrders()
      .then(({ data }) => setOrders(data.data.orders))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullScreen={false} />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50">My Orders</h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-secondary-500">You haven't placed any orders yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-secondary-500/10 bg-white p-4 dark:bg-secondary-900"
            >
              <div>
                <p className="font-medium text-secondary-900 dark:text-secondary-50">#{order.orderNumber}</p>
                <p className="text-xs text-secondary-500">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={cn('rounded-full px-3 py-1 text-xs font-medium capitalize', STATUS_COLORS[order.status])}>
                {order.status}
              </span>
              <p className="font-semibold text-secondary-900 dark:text-secondary-50">${order.total.toFixed(2)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

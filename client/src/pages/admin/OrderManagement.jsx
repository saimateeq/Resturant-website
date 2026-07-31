import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import cn from '@utils/cn';
import { orderService } from '@services/orderService';
import { ORDER_STATUS } from '@constants';
import Loader from '@components/common/Loader';

const STATUS_OPTIONS = Object.values(ORDER_STATUS);

const STATUS_COLORS = {
  pending: 'bg-amber-500/10 text-amber-600',
  accepted: 'bg-blue-500/10 text-blue-600',
  preparing: 'bg-blue-500/10 text-blue-600',
  ready: 'bg-purple-500/10 text-purple-600',
  delivered: 'bg-green-500/10 text-green-600',
  cancelled: 'bg-red-500/10 text-red-600',
  refunded: 'bg-red-500/10 text-red-600',
};

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    orderService
      .listAllOrders(statusFilter ? { status: statusFilter } : {})
      .then(({ data }) => setOrders(data.data.orders))
      .finally(() => setLoading(false));
  };

  useEffect(fetchOrders, [statusFilter]);

  const handleStatusChange = async (id, status) => {
    try {
      await orderService.updateOrderStatus(id, { status });
      toast.success('Order status updated');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update status');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50">Order Management</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-secondary-500/20 bg-white px-3 py-1.5 text-sm dark:bg-secondary-800 dark:text-secondary-50"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-secondary-500/10 bg-white dark:bg-secondary-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-secondary-500/10 text-secondary-500">
              <tr>
                <th className="p-4">Order</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-secondary-500/5">
                  <td className="p-4">
                    <Link to={`/orders/${order._id}`} className="font-medium text-primary-600 dark:text-primary-400">
                      #{order.orderNumber}
                    </Link>
                    <p className="text-xs text-secondary-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="p-4 text-secondary-600 dark:text-secondary-300">{order.user?.name}</td>
                  <td className="p-4 font-semibold text-secondary-900 dark:text-secondary-50">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium capitalize', STATUS_COLORS[order.status])}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="rounded-lg border border-secondary-500/20 bg-white px-2 py-1 text-xs dark:bg-secondary-800 dark:text-secondary-50"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

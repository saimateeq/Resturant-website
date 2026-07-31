import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiPackage, FiTruck, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { orderService } from '@services/orderService';
import Loader from '@components/common/Loader';
import Button from '@components/ui/Button';

const STEPS = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'delivered', label: 'Delivered' },
];

export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = () => {
    setLoading(true);
    orderService
      .getOrder(orderId)
      .then(({ data }) => setOrder(data.data.order))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  };

  useEffect(fetchOrder, [orderId]);

  const handleCancel = async () => {
    try {
      await orderService.cancelOrder(orderId);
      toast.success('Order cancelled');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel order');
    }
  };

  if (loading) return <Loader />;

  if (!order) {
    return (
      <div className="container-app py-24 text-center">
        <p className="text-secondary-500 dark:text-secondary-400">Order not found.</p>
        <Link to="/dashboard/orders" className="mt-4 inline-block text-primary-600 dark:text-primary-400">
          Back to orders
        </Link>
      </div>
    );
  }

  const isTerminal = order.status === 'cancelled' || order.status === 'refunded';
  const currentStepIndex = STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="container-app py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50">
            Order #{order.orderNumber}
          </h1>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        {['pending', 'accepted'].includes(order.status) && (
          <Button variant="outline" size="sm" onClick={handleCancel}>
            <FiXCircle size={14} /> Cancel Order
          </Button>
        )}
      </div>

      {isTerminal ? (
        <div className="mt-8 rounded-2xl bg-red-500/10 p-6 text-center text-red-600">
          This order was {order.status}.
        </div>
      ) : (
        <div className="mt-10 flex items-center justify-between">
          {STEPS.map((step, idx) => (
            <div key={step.key} className="flex flex-1 flex-col items-center text-center">
              <div className="flex w-full items-center">
                <div className={`h-0.5 flex-1 ${idx === 0 ? 'bg-transparent' : idx <= currentStepIndex ? 'bg-primary-500' : 'bg-secondary-500/20'}`} />
                <motion.div
                  animate={{ scale: idx === currentStepIndex ? 1.15 : 1 }}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-white ${
                    idx <= currentStepIndex ? 'bg-primary-500' : 'bg-secondary-300 dark:bg-secondary-700'
                  }`}
                >
                  {idx < currentStepIndex || (idx === currentStepIndex && order.status === 'delivered') ? (
                    <FiCheck size={16} />
                  ) : idx === STEPS.length - 1 ? (
                    <FiTruck size={16} />
                  ) : (
                    <FiPackage size={16} />
                  )}
                </motion.div>
                <div className={`h-0.5 flex-1 ${idx === STEPS.length - 1 ? 'bg-transparent' : idx < currentStepIndex ? 'bg-primary-500' : 'bg-secondary-500/20'}`} />
              </div>
              <p className="mt-2 text-xs font-medium text-secondary-600 dark:text-secondary-300">{step.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="rounded-2xl border border-secondary-500/10 bg-white p-6 lg:col-span-2 dark:bg-secondary-900">
          <h2 className="font-display text-lg font-semibold text-secondary-900 dark:text-secondary-50">
            Items
          </h2>
          <ul className="mt-4 space-y-3">
            {order.items.map((item) => (
              <li key={item.dish} className="flex items-center justify-between text-sm">
                <span className="text-secondary-700 dark:text-secondary-300">
                  {item.quantity} × {item.name}
                </span>
                <span className="font-medium text-secondary-900 dark:text-secondary-50">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-2 border-t border-secondary-500/10 pt-4 text-sm">
            <div className="flex justify-between text-secondary-600 dark:text-secondary-300">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-secondary-600 dark:text-secondary-300">
              <span>Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-secondary-600 dark:text-secondary-300">
              <span>Delivery</span>
              <span>{order.deliveryFee === 0 ? 'Free' : `$${order.deliveryFee.toFixed(2)}`}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-primary-600 dark:text-primary-400">
                <span>Discount</span>
                <span>-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold text-secondary-900 dark:text-secondary-50">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-secondary-500/10 bg-white p-6 dark:bg-secondary-900">
          <h2 className="font-display text-lg font-semibold text-secondary-900 dark:text-secondary-50">
            Delivery Info
          </h2>
          <dl className="mt-4 space-y-2 text-sm text-secondary-600 dark:text-secondary-300">
            <div>
              <dt className="text-secondary-400">Type</dt>
              <dd className="capitalize">{order.deliveryType}</dd>
            </div>
            {order.address && (
              <div>
                <dt className="text-secondary-400">Address</dt>
                <dd>
                  {order.address.street}, {order.address.city} {order.address.zipCode}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-secondary-400">Phone</dt>
              <dd>{order.phone}</dd>
            </div>
            <div>
              <dt className="text-secondary-400">Payment</dt>
              <dd className="capitalize">{order.paymentMethod.replace(/_/g, ' ')}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { updateQuantity, removeFromCart, applyCoupon } from '@redux/slices/cartSlice';
import { orderService } from '@services/orderService';
import { calculateCartTotals } from '@utils/pricing';
import Button from '@components/ui/Button';

export default function Cart() {
  const items = useSelector((state) => state.cart.items);
  const coupon = useSelector((state) => state.cart.coupon);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState(false);

  const totals = calculateCartTotals(items, { deliveryType: 'delivery', coupon });

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplying(true);
    try {
      const { data } = await orderService.validateCoupon(couponCode.trim(), totals.subtotal);
      dispatch(applyCoupon(data.data));
      toast.success(`Coupon "${data.data.code}" applied`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setApplying(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-app flex min-h-[60vh] flex-col items-center justify-center text-center">
        <FiShoppingBag size={48} className="text-secondary-300" />
        <h1 className="mt-4 text-2xl font-semibold text-secondary-900 dark:text-secondary-50">
          Your cart is empty
        </h1>
        <p className="mt-2 text-secondary-500 dark:text-secondary-400">
          Browse our menu and add something delicious.
        </p>
        <Link to="/menu">
          <Button className="mt-6">Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app py-16">
      <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-50">Your Cart</h1>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.dishId}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-4 rounded-2xl border border-secondary-500/10 bg-white p-4 dark:bg-secondary-900"
              >
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-secondary-100 dark:bg-secondary-800">
                  {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                </div>

                <div className="flex-1">
                  <h3 className="font-medium text-secondary-900 dark:text-secondary-50">{item.name}</h3>
                  <p className="text-sm text-secondary-500">${item.price.toFixed(2)} each</p>
                </div>

                <div className="flex items-center rounded-full border border-secondary-500/20">
                  <button
                    onClick={() => dispatch(updateQuantity({ dishId: item.dishId, quantity: item.quantity - 1 }))}
                    className="p-2 text-secondary-600 dark:text-secondary-300"
                  >
                    <FiMinus size={12} />
                  </button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => dispatch(updateQuantity({ dishId: item.dishId, quantity: item.quantity + 1 }))}
                    className="p-2 text-secondary-600 dark:text-secondary-300"
                  >
                    <FiPlus size={12} />
                  </button>
                </div>

                <p className="w-20 text-right font-semibold text-secondary-900 dark:text-secondary-50">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>

                <button
                  onClick={() => dispatch(removeFromCart(item.dishId))}
                  className="text-secondary-400 hover:text-red-500"
                  aria-label="Remove item"
                >
                  <FiTrash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="h-fit rounded-2xl border border-secondary-500/10 bg-white p-6 dark:bg-secondary-900">
          <h2 className="font-display text-lg font-semibold text-secondary-900 dark:text-secondary-50">
            Order Summary
          </h2>

          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 rounded-xl border border-secondary-500/20 bg-white px-3 py-2 text-sm dark:bg-secondary-800 dark:text-secondary-50"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={applying}
              className="rounded-xl bg-secondary-500/10 px-4 text-sm font-medium text-secondary-700 dark:text-secondary-200"
            >
              Apply
            </button>
          </div>

          <div className="mt-6 space-y-2 text-sm text-secondary-600 dark:text-secondary-300">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${totals.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{totals.deliveryFee === 0 ? 'Free' : `$${totals.deliveryFee.toFixed(2)}`}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-primary-600 dark:text-primary-400">
                <span>Discount ({coupon?.code})</span>
                <span>-${totals.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-secondary-500/10 pt-2 flex justify-between text-base font-semibold text-secondary-900 dark:text-secondary-50">
              <span>Total</span>
              <span>${totals.total.toFixed(2)}</span>
            </div>
          </div>

          <Button className="mt-6 w-full" onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}

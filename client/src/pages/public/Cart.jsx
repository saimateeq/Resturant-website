import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { updateQuantity, removeFromCart, applyCoupon } from '@redux/slices/cartSlice';
import { orderService } from '@services/orderService';
import { calculateCartTotals } from '@utils/pricing';

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
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-cream text-center">
        <FiShoppingBag size={44} className="text-ink/20" />
        <h1 className="mt-5 font-display text-3xl text-ink italic">Your cart is empty</h1>
        <p className="mt-2 font-body text-sm text-ink/55">Browse our menu and add something delicious.</p>
        <Link
          to="/menu"
          className="mt-8 inline-flex min-h-[44px] items-center justify-center border border-ink bg-ink px-7 font-body text-xs font-semibold tracking-[0.1em] text-cream uppercase transition-colors hover:bg-espresso"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-cream py-24 sm:py-32">
      <div className="container-app">
        <span className="eyebrow">Order Review</span>
        <h1 className="mt-5 font-display text-4xl text-ink italic sm:text-5xl">Your Cart</h1>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.dishId}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-4 border border-ink/10 p-4"
                >
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden bg-ink/5">
                    {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-display text-ink italic">{item.name}</h3>
                    <p className="font-body text-sm text-ink/50">${item.price.toFixed(2)} each</p>
                  </div>

                  <div className="flex items-center border border-ink/15">
                    <button
                      onClick={() => dispatch(updateQuantity({ dishId: item.dishId, quantity: item.quantity - 1 }))}
                      className="p-2 text-ink/60 hover:text-ink"
                    >
                      <FiMinus size={12} />
                    </button>
                    <span className="w-6 text-center font-body text-sm text-ink">{item.quantity}</span>
                    <button
                      onClick={() => dispatch(updateQuantity({ dishId: item.dishId, quantity: item.quantity + 1 }))}
                      className="p-2 text-ink/60 hover:text-ink"
                    >
                      <FiPlus size={12} />
                    </button>
                  </div>

                  <p className="w-20 text-right font-display text-ink">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>

                  <button
                    onClick={() => dispatch(removeFromCart(item.dishId))}
                    className="text-ink/35 hover:text-red-600"
                    aria-label="Remove item"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="h-fit border border-ink/10 p-6">
            <span className="eyebrow">Summary</span>
            <h2 className="mt-3 font-display text-lg text-ink italic">Order Summary</h2>

            <div className="mt-5 flex gap-2">
              <input
                type="text"
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 border-b border-ink/15 bg-transparent px-0 py-2 font-body text-sm text-ink outline-none focus:border-gold"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={applying}
                className="border border-ink/20 px-4 font-body text-sm font-medium text-ink/70 transition-colors hover:border-ink disabled:opacity-60"
              >
                Apply
              </button>
            </div>

            <div className="mt-6 space-y-2 font-body text-sm text-ink/65">
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
                <div className="flex justify-between text-gold">
                  <span>Discount ({coupon?.code})</span>
                  <span>-${totals.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-ink/10 pt-2 font-display text-base text-ink">
                <span>Total</span>
                <span>${totals.total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="mt-6 flex min-h-[44px] w-full items-center justify-center border border-ink bg-ink font-body text-xs font-semibold tracking-[0.1em] text-cream uppercase transition-colors hover:bg-espresso"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

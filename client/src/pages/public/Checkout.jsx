import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import cn from '@utils/cn';
import { calculateCartTotals } from '@utils/pricing';
import { orderService } from '@services/orderService';
import { clearCart } from '@redux/slices/cartSlice';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';

export default function Checkout() {
  const items = useSelector((state) => state.cart.items);
  const coupon = useSelector((state) => state.cart.coupon);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [deliveryType, setDeliveryType] = useState('delivery');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  // Guards the empty-cart redirect below from firing on the split-second
  // after a successful order clears the cart — without this, that effect
  // raced the post-order navigate() to /orders/:id and won, so a real order
  // would go through but the user landed back on an empty cart with no
  // confirmation at all.
  const [orderPlaced, setOrderPlaced] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { phone: user?.phone || '' } });

  const totals = calculateCartTotals(items, { deliveryType, coupon });

  useEffect(() => {
    if (items.length === 0 && !orderPlaced) navigate('/cart');
  }, [items.length, orderPlaced, navigate]);

  if (items.length === 0 && !orderPlaced) {
    return null;
  }

  const onSubmit = async (formData) => {
    try {
      const payload = {
        items: items.map((item) => ({ dishId: item.dishId, quantity: item.quantity })),
        deliveryType,
        paymentMethod,
        phone: formData.phone,
        specialNotes: formData.specialNotes,
        couponCode: coupon?.code,
        address:
          deliveryType === 'delivery'
            ? {
                street: formData.street,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                country: formData.country || 'USA',
              }
            : undefined,
      };

      const { data } = await orderService.createOrder(payload);
      setOrderPlaced(true);
      dispatch(clearCart());
      toast.success('Order placed!');
      navigate(`/orders/${data.data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place order');
    }
  };

  return (
    <div className="container-app py-16">
      <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-50">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-secondary-500/10 bg-white p-6 dark:bg-secondary-900">
            <h2 className="font-display text-lg font-semibold text-secondary-900 dark:text-secondary-50">
              Delivery Method
            </h2>
            <div className="mt-4 flex gap-3">
              {['delivery', 'pickup'].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setDeliveryType(type)}
                  className={cn(
                    'flex-1 rounded-xl border py-3 text-sm font-medium capitalize transition-colors',
                    deliveryType === type
                      ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400'
                      : 'border-secondary-500/20 text-secondary-600 dark:text-secondary-300',
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            {deliveryType === 'delivery' && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    label="Street address"
                    error={errors.street?.message}
                    {...register('street', { required: deliveryType === 'delivery' && 'Street is required' })}
                  />
                </div>
                <Input
                  label="City"
                  error={errors.city?.message}
                  {...register('city', { required: deliveryType === 'delivery' && 'City is required' })}
                />
                <Input label="State" {...register('state')} />
                <Input label="Zip code" {...register('zipCode')} />
                <Input label="Country" defaultValue="USA" {...register('country')} />
              </div>
            )}

            <div className="mt-4">
              <Input
                label="Phone number"
                error={errors.phone?.message}
                {...register('phone', { required: 'Phone number is required' })}
              />
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                Special notes (optional)
              </label>
              <textarea
                rows={3}
                placeholder="Allergies, delivery instructions, etc."
                {...register('specialNotes')}
                className="w-full rounded-xl border border-secondary-500/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-500 dark:bg-secondary-800 dark:text-secondary-50"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-secondary-500/10 bg-white p-6 dark:bg-secondary-900">
            <h2 className="font-display text-lg font-semibold text-secondary-900 dark:text-secondary-50">
              Payment Method
            </h2>
            <div className="mt-4 space-y-2">
              {[
                { value: 'cash_on_delivery', label: 'Cash on Delivery' },
                { value: 'card', label: 'Credit / Debit Card' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-3 rounded-xl border border-secondary-500/20 p-3 text-sm"
                >
                  <input
                    type="radio"
                    checked={paymentMethod === opt.value}
                    onChange={() => setPaymentMethod(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="h-fit rounded-2xl border border-secondary-500/10 bg-white p-6 dark:bg-secondary-900">
          <h2 className="font-display text-lg font-semibold text-secondary-900 dark:text-secondary-50">
            Order Summary
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-secondary-600 dark:text-secondary-300">
            {items.map((item) => (
              <li key={item.dishId} className="flex justify-between">
                <span>
                  {item.quantity} × {item.name}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-secondary-500/10 pt-4 text-sm text-secondary-600 dark:text-secondary-300">
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
                <span>Discount</span>
                <span>-${totals.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold text-secondary-900 dark:text-secondary-50">
              <span>Total</span>
              <span>${totals.total.toFixed(2)}</span>
            </div>
          </div>

          <Button type="submit" className="mt-6 w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Placing order…' : 'Place Order'}
          </Button>
        </div>
      </form>
    </div>
  );
}

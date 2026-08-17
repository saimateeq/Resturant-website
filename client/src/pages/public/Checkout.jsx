import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import cn from '@utils/cn';
import { calculateCartTotals } from '@utils/pricing';
import { orderService } from '@services/orderService';
import { clearCart } from '@redux/slices/cartSlice';

const fieldClass =
  'w-full border-b border-ink/15 bg-transparent px-0 py-2.5 font-body text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-gold';
const labelClass = 'mb-1.5 block font-body text-xs font-semibold tracking-[0.1em] text-ink/50 uppercase';

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
    <div className="bg-cream py-24 sm:py-32">
      <div className="container-app">
        <span className="eyebrow">Almost There</span>
        <h1 className="mt-5 font-display text-4xl text-ink italic sm:text-5xl">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="border border-ink/10 p-6">
              <h2 className="font-display text-lg text-ink italic">Delivery Method</h2>
              <div className="mt-4 flex gap-3">
                {['delivery', 'pickup'].map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setDeliveryType(type)}
                    className={cn(
                      'flex-1 border py-3 font-body text-sm capitalize transition-colors',
                      deliveryType === type
                        ? 'border-ink bg-ink text-cream'
                        : 'border-ink/15 text-ink/60 hover:border-ink/40',
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {deliveryType === 'delivery' && (
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Street address</label>
                    <input
                      className={fieldClass}
                      {...register('street', { required: deliveryType === 'delivery' && 'Street is required' })}
                    />
                    {errors.street && <p className="mt-1.5 text-xs text-red-600">{errors.street.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>City</label>
                    <input
                      className={fieldClass}
                      {...register('city', { required: deliveryType === 'delivery' && 'City is required' })}
                    />
                    {errors.city && <p className="mt-1.5 text-xs text-red-600">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>State</label>
                    <input className={fieldClass} {...register('state')} />
                  </div>
                  <div>
                    <label className={labelClass}>Zip code</label>
                    <input className={fieldClass} {...register('zipCode')} />
                  </div>
                  <div>
                    <label className={labelClass}>Country</label>
                    <input className={fieldClass} defaultValue="USA" {...register('country')} />
                  </div>
                </div>
              )}

              <div className="mt-6">
                <label className={labelClass}>Phone number</label>
                <input className={fieldClass} {...register('phone', { required: 'Phone number is required' })} />
                {errors.phone && <p className="mt-1.5 text-xs text-red-600">{errors.phone.message}</p>}
              </div>

              <div className="mt-6">
                <label className={labelClass}>Special notes (optional)</label>
                <textarea
                  rows={3}
                  placeholder="Allergies, delivery instructions, etc."
                  {...register('specialNotes')}
                  className={cn(fieldClass, 'resize-none')}
                />
              </div>
            </div>

            <div className="border border-ink/10 p-6">
              <h2 className="font-display text-lg text-ink italic">Payment Method</h2>
              <div className="mt-4 space-y-2">
                {[
                  { value: 'cash_on_delivery', label: 'Cash on Delivery' },
                  { value: 'card', label: 'Credit / Debit Card' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-3 border border-ink/15 p-3 font-body text-sm text-ink/80"
                  >
                    <input
                      type="radio"
                      checked={paymentMethod === opt.value}
                      onChange={() => setPaymentMethod(opt.value)}
                      className="accent-ink"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="h-fit border border-ink/10 p-6">
            <h2 className="font-display text-lg text-ink italic">Order Summary</h2>
            <ul className="mt-4 space-y-2 font-body text-sm text-ink/65">
              {items.map((item) => (
                <li key={item.dishId} className="flex justify-between">
                  <span>
                    {item.quantity} × {item.name}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2 border-t border-ink/10 pt-4 font-body text-sm text-ink/65">
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
                  <span>Discount</span>
                  <span>-${totals.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-display text-base text-ink">
                <span>Total</span>
                <span>${totals.total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 flex min-h-[44px] w-full items-center justify-center border border-ink bg-ink font-body text-xs font-semibold tracking-[0.1em] text-cream uppercase transition-colors hover:bg-espresso disabled:opacity-60"
            >
              {isSubmitting ? 'Placing order…' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

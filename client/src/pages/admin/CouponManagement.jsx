import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { couponService } from '@services/couponService';
import Modal from '@components/ui/Modal';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import Loader from '@components/common/Loader';

function CouponFormModal({ isOpen, onClose, onSaved }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm({ defaultValues: { type: 'percentage' } });

  const type = watch('type');

  const onSubmit = async (formData) => {
    try {
      await couponService.create(formData);
      toast.success('Coupon created');
      reset();
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create coupon');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Coupon">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Code" placeholder="SAVE20" {...register('code', { required: true })} />
        <Input label="Description" {...register('description')} />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-secondary-700 dark:text-secondary-300">
            Type
          </label>
          <select
            {...register('type')}
            className="w-full rounded-xl border border-secondary-500/20 bg-white px-4 py-2.5 text-sm dark:bg-secondary-800 dark:text-secondary-50"
          >
            <option value="percentage">Percentage Discount</option>
            <option value="flat">Flat Discount</option>
            <option value="free_delivery">Free Delivery</option>
          </select>
        </div>

        {type !== 'free_delivery' && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
              type="number"
              step="0.01"
              {...register('value', { required: type !== 'free_delivery' })}
            />
            {type === 'percentage' && <Input label="Max discount ($)" type="number" {...register('maxDiscount')} />}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input label="Min purchase ($)" type="number" {...register('minPurchase')} />
          <Input label="Usage limit" type="number" {...register('usageLimit')} />
        </div>

        <Input label="Expiry date" type="date" {...register('expiryDate', { required: true })} />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Create Coupon'}
        </Button>
      </form>
    </Modal>
  );
}

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchCoupons = () => {
    setLoading(true);
    couponService
      .list()
      .then(({ data }) => setCoupons(data.data.coupons))
      .finally(() => setLoading(false));
  };

  useEffect(fetchCoupons, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await couponService.remove(id);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete coupon');
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await couponService.update(coupon._id, { isActive: !coupon.isActive });
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update coupon');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50">Coupons</h1>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <FiPlus size={14} /> Create Coupon
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((coupon) => (
          <div
            key={coupon._id}
            className="rounded-2xl border border-secondary-500/10 bg-white p-5 dark:bg-secondary-900"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-lg font-bold text-primary-600 dark:text-primary-400">
                  {coupon.code}
                </p>
                <p className="text-xs text-secondary-500">{coupon.description}</p>
              </div>
              <button onClick={() => handleDelete(coupon._id)} aria-label="Delete coupon" className="text-secondary-400 hover:text-red-500">
                <FiTrash2 size={16} />
              </button>
            </div>

            <p className="mt-3 text-sm text-secondary-600 dark:text-secondary-300">
              {coupon.type === 'percentage' && `${coupon.value}% off`}
              {coupon.type === 'flat' && `$${coupon.value} off`}
              {coupon.type === 'free_delivery' && 'Free delivery'}
            </p>
            <p className="text-xs text-secondary-400">
              Expires {new Date(coupon.expiryDate).toLocaleDateString()} · Used {coupon.usedCount}
              {coupon.usageLimit ? `/${coupon.usageLimit}` : ''} times
            </p>

            <button
              onClick={() => handleToggleActive(coupon)}
              className={`mt-3 rounded-full px-3 py-1 text-xs font-medium ${
                coupon.isActive ? 'bg-green-500/10 text-green-600' : 'bg-secondary-500/10 text-secondary-500'
              }`}
            >
              {coupon.isActive ? 'Active' : 'Inactive'}
            </button>
          </div>
        ))}
      </div>

      <CouponFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSaved={fetchCoupons} />
    </div>
  );
}

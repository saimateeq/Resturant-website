import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiCheckCircle } from 'react-icons/fi';
import cn from '@utils/cn';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import { reservationService } from '@services/reservationService';
import { useSEO } from '@hooks/useSEO';

const OCCASIONS = [
  { value: 'none', label: 'None' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'other', label: 'Other' },
];

export default function Reservations() {
  useSEO({
    title: 'Reserve a Table',
    description: 'Book a table at Savoria — choose your date, time, seating, and occasion.',
  });
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [seating, setSeating] = useState('indoor');
  const [submitted, setSubmitted] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { name: user?.name || '', phone: user?.phone || '', guests: 2, occasion: 'none' },
  });

  const onSubmit = async (formData) => {
    try {
      const { data } = await reservationService.create({ ...formData, seating });
      setSubmitted(data.data.reservation);
      toast.success('Reservation request submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit reservation');
    }
  };

  if (submitted) {
    return (
      <div className="container-app flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <FiCheckCircle size={56} className="text-primary-500" />
        <h1 className="mt-4 text-2xl font-bold text-secondary-900 dark:text-secondary-50">
          Request received!
        </h1>
        <p className="mt-2 max-w-md text-secondary-500 dark:text-secondary-400">
          We've sent your reservation for {new Date(submitted.date).toDateString()} at {submitted.time}{' '}
          to our team. You'll receive an email once it's confirmed.
        </p>
        <Button className="mt-6" onClick={() => navigate('/dashboard/reservations')}>
          View My Reservations
        </Button>
      </div>
    );
  }

  return (
    <div className="container-app py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-4xl font-bold text-secondary-900 dark:text-secondary-50">Reserve a Table</h1>
        <p className="mt-3 text-secondary-500 dark:text-secondary-400">
          Book your table for an unforgettable dining experience
        </p>
      </motion.div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto mt-10 max-w-2xl space-y-6 rounded-3xl border border-secondary-500/10 bg-white p-8 shadow-soft dark:bg-secondary-900"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Full name" error={errors.name?.message} {...register('name', { required: 'Name is required' })} />
          <Input label="Phone" error={errors.phone?.message} {...register('phone', { required: 'Phone is required' })} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Date"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            error={errors.date?.message}
            {...register('date', { required: 'Date is required' })}
          />
          <Input
            label="Time"
            type="time"
            error={errors.time?.message}
            {...register('time', { required: 'Time is required' })}
          />
          <Input
            label="Guests"
            type="number"
            min={1}
            max={30}
            error={errors.guests?.message}
            {...register('guests', { required: true, min: 1, max: 30 })}
          />
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-secondary-700 dark:text-secondary-300">Seating</p>
          <div className="flex gap-3">
            {['indoor', 'outdoor'].map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => setSeating(type)}
                className={cn(
                  'flex-1 rounded-xl border py-2.5 text-sm font-medium capitalize transition-colors',
                  seating === type
                    ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400'
                    : 'border-secondary-500/20 text-secondary-600 dark:text-secondary-300',
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-secondary-700 dark:text-secondary-300">
            Occasion
          </label>
          <select
            {...register('occasion')}
            className="w-full rounded-xl border border-secondary-500/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-500 dark:bg-secondary-800 dark:text-secondary-50"
          >
            {OCCASIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-secondary-700 dark:text-secondary-300">
            Notes (optional)
          </label>
          <textarea
            rows={3}
            placeholder="Any special requests?"
            {...register('notes')}
            className="w-full rounded-xl border border-secondary-500/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-500 dark:bg-secondary-800 dark:text-secondary-50"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting…' : 'Request Reservation'}
        </Button>
      </form>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiCheckCircle } from 'react-icons/fi';
import cn from '@utils/cn';
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

const fieldClass =
  'w-full border-b border-ink/15 bg-transparent px-0 py-3 font-body text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-gold';
const labelClass = 'mb-1.5 block font-body text-xs font-semibold tracking-[0.1em] text-ink/50 uppercase';

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
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-cream px-6 py-24 text-center">
        <FiCheckCircle size={48} className="text-gold" />
        <h1 className="mt-6 font-display text-3xl text-ink italic sm:text-4xl">Request received!</h1>
        <p className="mt-3 max-w-md font-body text-sm text-ink/60">
          We've sent your reservation for {new Date(submitted.date).toDateString()} at {submitted.time}{' '}
          to our team. You'll receive an email once it's confirmed.
        </p>
        <button
          type="button"
          onClick={() => navigate('/dashboard/reservations')}
          className="mt-8 min-h-[44px] border border-ink bg-ink px-7 py-3.5 font-body text-xs font-semibold tracking-[0.1em] text-cream uppercase transition-colors hover:bg-espresso"
        >
          View My Reservations
        </button>
      </div>
    );
  }

  return (
    <div className="bg-cream py-24 sm:py-32">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <span className="eyebrow">Ready for Dinner?</span>
          <h1 className="mt-5 font-display text-4xl leading-[1.1] text-ink italic sm:text-5xl">
            A table is waiting.
          </h1>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="mx-auto mt-14 max-w-2xl space-y-9">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Full name</label>
              <input className={fieldClass} {...register('name', { required: 'Name is required' })} />
              {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input className={fieldClass} {...register('phone', { required: 'Phone is required' })} />
              {errors.phone && <p className="mt-1.5 text-xs text-red-600">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className={fieldClass}
                {...register('date', { required: 'Date is required' })}
              />
              {errors.date && <p className="mt-1.5 text-xs text-red-600">{errors.date.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Time</label>
              <input type="time" className={fieldClass} {...register('time', { required: 'Time is required' })} />
              {errors.time && <p className="mt-1.5 text-xs text-red-600">{errors.time.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Guests</label>
              <input
                type="number"
                min={1}
                max={30}
                className={fieldClass}
                {...register('guests', { required: true, min: 1, max: 30 })}
              />
            </div>
          </div>

          <div>
            <p className={labelClass}>Seating</p>
            <div className="flex gap-3">
              {['indoor', 'outdoor'].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setSeating(type)}
                  className={cn(
                    'flex-1 border py-3 font-body text-sm capitalize transition-colors',
                    seating === type ? 'border-ink bg-ink text-cream' : 'border-ink/15 text-ink/60 hover:border-ink/40',
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Occasion</label>
            <select {...register('occasion')} className={cn(fieldClass, 'cursor-pointer')}>
              {OCCASIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Notes (optional)</label>
            <textarea
              rows={3}
              placeholder="Any special requests?"
              {...register('notes')}
              className={cn(fieldClass, 'resize-none')}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-[44px] w-full border border-ink bg-ink py-4 font-body text-xs font-semibold tracking-[0.1em] text-cream uppercase transition-colors hover:bg-espresso disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting…' : 'Find a Table'}
          </button>
        </form>
      </div>
    </div>
  );
}

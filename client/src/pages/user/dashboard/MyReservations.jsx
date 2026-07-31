import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import cn from '@utils/cn';
import { reservationService } from '@services/reservationService';
import Loader from '@components/common/Loader';
import Button from '@components/ui/Button';

const STATUS_COLORS = {
  pending: 'bg-amber-500/10 text-amber-600',
  approved: 'bg-green-500/10 text-green-600',
  rejected: 'bg-red-500/10 text-red-600',
  cancelled: 'bg-secondary-500/10 text-secondary-500',
  completed: 'bg-blue-500/10 text-blue-600',
};

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = () => {
    setLoading(true);
    reservationService
      .getMyReservations()
      .then(({ data }) => setReservations(data.data.reservations))
      .finally(() => setLoading(false));
  };

  useEffect(fetchReservations, []);

  const handleCancel = async (id) => {
    try {
      await reservationService.cancel(id);
      toast.success('Reservation cancelled');
      fetchReservations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel reservation');
    }
  };

  if (loading) return <Loader fullScreen={false} />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50">My Reservations</h1>

      {reservations.length === 0 ? (
        <p className="mt-6 text-secondary-500">No reservations yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {reservations.map((r) => (
            <div
              key={r._id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-secondary-500/10 bg-white p-4 dark:bg-secondary-900"
            >
              <div>
                <p className="font-medium text-secondary-900 dark:text-secondary-50">
                  {new Date(r.date).toDateString()} at {r.time}
                </p>
                <p className="text-xs text-secondary-500">
                  {r.guests} guests · {r.seating} · {r.occasion !== 'none' ? r.occasion : 'No occasion'}
                </p>
              </div>
              <span className={cn('rounded-full px-3 py-1 text-xs font-medium capitalize', STATUS_COLORS[r.status])}>
                {r.status}
              </span>
              {['pending', 'approved'].includes(r.status) && (
                <Button variant="outline" size="sm" onClick={() => handleCancel(r._id)}>
                  Cancel
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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

export default function ReservationManagement() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableInputs, setTableInputs] = useState({});

  const fetchReservations = () => {
    setLoading(true);
    reservationService
      .listAll()
      .then(({ data }) => setReservations(data.data.reservations))
      .finally(() => setLoading(false));
  };

  useEffect(fetchReservations, []);

  const handleApprove = async (id) => {
    try {
      await reservationService.updateStatus(id, { status: 'approved', tableNumber: tableInputs[id] });
      toast.success('Reservation approved');
      fetchReservations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not approve');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Reason for rejection (optional):') || '';
    try {
      await reservationService.updateStatus(id, { status: 'rejected', rejectionReason: reason });
      toast.success('Reservation rejected');
      fetchReservations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not reject');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50">Reservation Management</h1>

      <div className="mt-6 space-y-3">
        {reservations.map((r) => (
          <div
            key={r._id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-secondary-500/10 bg-white p-4 dark:bg-secondary-900"
          >
            <div>
              <p className="font-medium text-secondary-900 dark:text-secondary-50">
                {r.name} · {r.user?.email}
              </p>
              <p className="text-sm text-secondary-500">
                {new Date(r.date).toDateString()} at {r.time} · {r.guests} guests · {r.seating}
                {r.occasion !== 'none' && ` · ${r.occasion}`}
              </p>
              {r.notes && <p className="mt-1 text-xs text-secondary-400">Note: {r.notes}</p>}
            </div>

            <div className="flex items-center gap-2">
              <span className={cn('rounded-full px-3 py-1 text-xs font-medium capitalize', STATUS_COLORS[r.status])}>
                {r.status}
              </span>

              {r.status === 'pending' && (
                <>
                  <input
                    placeholder="Table #"
                    value={tableInputs[r._id] || ''}
                    onChange={(e) => setTableInputs((prev) => ({ ...prev, [r._id]: e.target.value }))}
                    className="w-20 rounded-lg border border-secondary-500/20 bg-white px-2 py-1 text-xs dark:bg-secondary-800 dark:text-secondary-50"
                  />
                  <Button size="sm" onClick={() => handleApprove(r._id)}>
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleReject(r._id)}>
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

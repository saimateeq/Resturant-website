import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import { notificationService } from '@services/notificationService';
import Loader from '@components/common/Loader';
import Button from '@components/ui/Button';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    setLoading(true);
    notificationService
      .getMine()
      .then(({ data }) => setNotifications(data.data.notifications))
      .finally(() => setLoading(false));
  };

  useEffect(fetchNotifications, []);

  const handleMarkAll = async () => {
    await notificationService.markAllAsRead();
    fetchNotifications();
  };

  if (loading) return <Loader fullScreen={false} />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50">Notifications</h1>
        {notifications.some((n) => !n.isRead) && (
          <Button variant="outline" size="sm" onClick={handleMarkAll}>
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="mt-6 text-secondary-500">No notifications yet.</p>
      ) : (
        <div className="mt-6 space-y-2">
          {notifications.map((n) => (
            <Link
              key={n._id}
              to={n.link || '#'}
              onClick={() => notificationService.markAsRead(n._id)}
              className={`flex items-start gap-3 rounded-2xl border p-4 ${
                n.isRead
                  ? 'border-secondary-500/10 bg-white dark:bg-secondary-900'
                  : 'border-primary-500/30 bg-primary-500/5'
              }`}
            >
              <FiBell className="mt-1 text-primary-500" size={16} />
              <div>
                <p className="font-medium text-secondary-900 dark:text-secondary-50">{n.title}</p>
                <p className="text-sm text-secondary-500">{n.message}</p>
                <p className="mt-1 text-xs text-secondary-400">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

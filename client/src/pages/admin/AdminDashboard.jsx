import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { FiDollarSign, FiShoppingBag, FiCalendar, FiUsers } from 'react-icons/fi';
import { analyticsService } from '@services/analyticsService';
import StatCard from '@components/admin/StatCard';
import Loader from '@components/common/Loader';

const STATUS_COLORS = {
  pending: 'var(--color-primary-400)',
  accepted: '#3b82f6',
  preparing: '#3b82f6',
  ready: '#a855f7',
  delivered: '#22c55e',
  cancelled: '#ef4444',
  refunded: '#ef4444',
};

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsService.getSummary(),
      analyticsService.getOrderStatusBreakdown(),
    ]).then(([summaryRes, statusRes]) => {
      setSummary(summaryRes.data.data);
      setStatusBreakdown(statusRes.data.data.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    analyticsService.getRevenue(period).then(({ data }) => setRevenue(data.data.data));
  }, [period]);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Revenue" value={summary.totalRevenue} icon={FiDollarSign} prefix="$" accent="green" />
        <StatCard label="Today's Revenue" value={summary.todayRevenue} icon={FiDollarSign} prefix="$" accent="primary" />
        <StatCard label="Total Orders" value={summary.totalOrders} icon={FiShoppingBag} accent="blue" />
        <StatCard label="Customers" value={summary.totalCustomers} icon={FiUsers} accent="purple" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's Orders" value={summary.todayOrders} icon={FiShoppingBag} accent="blue" />
        <StatCard label="Total Reservations" value={summary.totalReservations} icon={FiCalendar} accent="amber" />
        <StatCard label="Pending Reservations" value={summary.pendingReservations} icon={FiCalendar} accent="amber" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-secondary-500/10 bg-white p-6 xl:col-span-2 dark:bg-secondary-900">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-secondary-900 dark:text-secondary-50">
              Revenue
            </h2>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-lg border border-secondary-500/20 bg-white px-3 py-1.5 text-sm dark:bg-secondary-800 dark:text-secondary-50"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="year">Last 12 months</option>
            </select>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-secondary-200)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="var(--color-primary-600)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-secondary-500/10 bg-white p-6 dark:bg-secondary-900">
          <h2 className="font-display text-lg font-semibold text-secondary-900 dark:text-secondary-50">
            Order Status
          </h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusBreakdown} dataKey="count" nameKey="status" innerRadius={50} outerRadius={80}>
                  {statusBreakdown.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-secondary-500/10 bg-white p-6 dark:bg-secondary-900">
        <h2 className="font-display text-lg font-semibold text-secondary-900 dark:text-secondary-50">
          Popular Dishes
        </h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary.popularDishes}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-secondary-200)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="orderCount" fill="var(--color-primary-600)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

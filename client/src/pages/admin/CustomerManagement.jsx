import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiSearch } from 'react-icons/fi';
import { adminService } from '@services/adminService';
import { useDebounce } from '@hooks/useDebounce';
import Loader from '@components/common/Loader';
import Button from '@components/ui/Button';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(search, 400);

  const fetchCustomers = () => {
    setLoading(true);
    adminService
      .listCustomers({ search: debouncedSearch || undefined })
      .then(({ data }) => setCustomers(data.data.customers))
      .finally(() => setLoading(false));
  };

  useEffect(fetchCustomers, [debouncedSearch]);

  const handleToggleBlock = async (customer) => {
    try {
      await adminService.setCustomerBlockedStatus(customer._id, !customer.isBlocked);
      toast.success(customer.isBlocked ? 'Customer unblocked' : 'Customer blocked');
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update customer');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50">Customers</h1>

      <div className="relative mt-4 max-w-sm">
        <FiSearch className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-secondary-400" />
        <input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full border border-secondary-500/20 bg-white py-2.5 pr-4 pl-11 text-sm dark:bg-secondary-800 dark:text-secondary-50"
        />
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-secondary-500/10 bg-white dark:bg-secondary-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-secondary-500/10 text-secondary-500">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Reward Points</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id} className="border-b border-secondary-500/5">
                  <td className="p-4 font-medium text-secondary-900 dark:text-secondary-50">{c.name}</td>
                  <td className="p-4 text-secondary-500">{c.email}</td>
                  <td className="p-4 text-secondary-600 dark:text-secondary-300">{c.rewardPoints}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        c.isBlocked ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-600'
                      }`}
                    >
                      {c.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Button size="sm" variant="outline" onClick={() => handleToggleBlock(c)}>
                      {c.isBlocked ? 'Unblock' : 'Block'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

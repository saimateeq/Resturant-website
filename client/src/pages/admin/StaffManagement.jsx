import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { adminService } from '@services/adminService';
import Modal from '@components/ui/Modal';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import Loader from '@components/common/Loader';

const ROLES = ['manager', 'chef', 'waiter', 'cashier', 'rider', 'admin'];

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({ defaultValues: { role: 'waiter' } });

  const fetchStaff = () => {
    setLoading(true);
    adminService
      .listStaff()
      .then(({ data }) => setStaff(data.data.staff))
      .finally(() => setLoading(false));
  };

  useEffect(fetchStaff, []);

  const onSubmit = async (formData) => {
    try {
      await adminService.createStaff(formData);
      toast.success('Staff member added');
      reset();
      setModalOpen(false);
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add staff member');
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await adminService.updateStaffRole(id, role);
      toast.success('Role updated');
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update role');
    }
  };

  const handleRemove = async (id) => {
    if (!confirm('Remove this staff member?')) return;
    try {
      await adminService.removeStaff(id);
      toast.success('Staff member removed');
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove staff member');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50">Staff Management</h1>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <FiPlus size={14} /> Add Staff
        </Button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-secondary-500/10 bg-white dark:bg-secondary-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-secondary-500/10 text-secondary-500">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s._id} className="border-b border-secondary-500/5">
                <td className="p-4 font-medium text-secondary-900 dark:text-secondary-50">{s.name}</td>
                <td className="p-4 text-secondary-500">{s.email}</td>
                <td className="p-4">
                  <select
                    value={s.role}
                    onChange={(e) => handleRoleChange(s._id, e.target.value)}
                    className="rounded-lg border border-secondary-500/20 bg-white px-2 py-1 text-xs capitalize dark:bg-secondary-800 dark:text-secondary-50"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleRemove(s._id)} aria-label="Remove staff member" className="text-secondary-400 hover:text-red-500">
                    <FiTrash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Staff Member">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full name" {...register('name', { required: true })} />
          <Input label="Email" type="email" {...register('email', { required: true })} />
          <Input label="Phone" {...register('phone')} />
          <Input label="Temporary password" type="password" {...register('password', { required: true })} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-secondary-700 dark:text-secondary-300">
              Role
            </label>
            <select
              {...register('role')}
              className="w-full rounded-xl border border-secondary-500/20 bg-white px-4 py-2.5 text-sm capitalize dark:bg-secondary-800 dark:text-secondary-50"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Adding…' : 'Add Staff Member'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

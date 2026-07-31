import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiTrash2, FiPlus, FiMapPin } from 'react-icons/fi';
import { userService } from '@services/userService';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import Loader from '@components/common/Loader';

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();

  const fetchAddresses = () => {
    setLoading(true);
    userService
      .listAddresses()
      .then(({ data }) => setAddresses(data.data.addresses))
      .finally(() => setLoading(false));
  };

  useEffect(fetchAddresses, []);

  const onSubmit = async (formData) => {
    try {
      await userService.addAddress(formData);
      toast.success('Address added');
      reset();
      setShowForm(false);
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add address');
    }
  };

  const handleDelete = async (id) => {
    try {
      await userService.deleteAddress(id);
      fetchAddresses();
    } catch {
      toast.error('Could not remove address');
    }
  };

  if (loading) return <Loader fullScreen={false} />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50">Addresses</h1>
        <Button size="sm" onClick={() => setShowForm((prev) => !prev)}>
          <FiPlus size={14} /> Add Address
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 grid grid-cols-1 gap-4 rounded-2xl border border-secondary-500/10 bg-white p-6 sm:grid-cols-2 dark:bg-secondary-900"
        >
          <Input label="Label" placeholder="Home, Work..." {...register('label')} />
          <Input label="Street" {...register('street', { required: true })} />
          <Input label="City" {...register('city', { required: true })} />
          <Input label="State" {...register('state')} />
          <Input label="Zip code" {...register('zipCode')} />
          <Input label="Country" defaultValue="USA" {...register('country')} />
          <div className="sm:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save Address'}
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {addresses.map((addr) => (
          <div
            key={addr._id}
            className="flex items-start justify-between rounded-2xl border border-secondary-500/10 bg-white p-4 dark:bg-secondary-900"
          >
            <div className="flex gap-3">
              <FiMapPin className="mt-1 text-primary-500" size={16} />
              <div>
                <p className="font-medium text-secondary-900 dark:text-secondary-50">
                  {addr.label} {addr.isDefault && <span className="text-xs text-primary-500">(Default)</span>}
                </p>
                <p className="text-sm text-secondary-500">
                  {addr.street}, {addr.city} {addr.zipCode}
                </p>
              </div>
            </div>
            <button onClick={() => handleDelete(addr._id)} aria-label="Delete address" className="text-secondary-400 hover:text-red-500">
              <FiTrash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

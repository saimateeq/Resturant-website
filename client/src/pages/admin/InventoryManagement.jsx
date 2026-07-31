import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiPlus, FiAlertTriangle, FiTrash2, FiPackage } from 'react-icons/fi';
import { inventoryService } from '@services/inventoryService';
import Modal from '@components/ui/Modal';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import Loader from '@components/common/Loader';

const UNITS = ['kg', 'g', 'liter', 'ml', 'pieces', 'dozen'];

function AddIngredientModal({ isOpen, onClose, onSaved }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({ defaultValues: { unit: 'kg' } });

  const onSubmit = async (formData) => {
    try {
      await inventoryService.create(formData);
      toast.success('Ingredient added');
      reset();
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add ingredient');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Ingredient">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Name" {...register('name', { required: true })} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-secondary-700 dark:text-secondary-300">
              Unit
            </label>
            <select
              {...register('unit')}
              className="w-full rounded-xl border border-secondary-500/20 bg-white px-4 py-2.5 text-sm dark:bg-secondary-800 dark:text-secondary-50"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <Input label="Current stock" type="number" step="0.01" {...register('currentStock', { required: true })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Low stock threshold" type="number" {...register('lowStockThreshold')} />
          <Input label="Cost per unit" type="number" step="0.01" {...register('costPerUnit')} />
        </div>
        <Input label="Expiry date" type="date" {...register('expiryDate')} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Supplier name" {...register('supplier.name')} />
          <Input label="Supplier contact" {...register('supplier.contact')} />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Add Ingredient'}
        </Button>
      </form>
    </Modal>
  );
}

export default function InventoryManagement() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState('');

  const fetchIngredients = () => {
    setLoading(true);
    const params = {};
    if (filter === 'low') params.lowStock = 'true';
    if (filter === 'expiring') params.expiringSoon = 'true';
    inventoryService
      .list(params)
      .then(({ data }) => setIngredients(data.data.ingredients))
      .finally(() => setLoading(false));
  };

  useEffect(fetchIngredients, [filter]);

  const handleDelete = async (id) => {
    if (!confirm('Remove this ingredient?')) return;
    try {
      await inventoryService.remove(id);
      toast.success('Ingredient removed');
      fetchIngredients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove ingredient');
    }
  };

  const handleQuickPurchase = async (ingredient) => {
    const quantity = prompt(`Add stock for ${ingredient.name} (${ingredient.unit}):`);
    if (!quantity || isNaN(quantity)) return;
    try {
      await inventoryService.recordPurchase(ingredient._id, { quantity: Number(quantity), cost: 0 });
      toast.success('Stock updated');
      fetchIngredients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update stock');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50">Inventory</h1>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-secondary-500/20 bg-white px-3 py-1.5 text-sm dark:bg-secondary-800 dark:text-secondary-50"
          >
            <option value="">All ingredients</option>
            <option value="low">Low stock</option>
            <option value="expiring">Expiring soon</option>
          </select>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <FiPlus size={14} /> Add Ingredient
          </Button>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-secondary-500/10 bg-white dark:bg-secondary-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-secondary-500/10 text-secondary-500">
              <tr>
                <th className="p-4">Ingredient</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Expiry</th>
                <th className="p-4">Supplier</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ing) => (
                <tr key={ing._id} className="border-b border-secondary-500/5">
                  <td className="p-4 font-medium text-secondary-900 dark:text-secondary-50">{ing.name}</td>
                  <td className="p-4">
                    <span className="flex items-center gap-1.5">
                      {ing.currentStock} {ing.unit}
                      {ing.isLowStock && (
                        <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-600">
                          <FiAlertTriangle size={10} /> Low
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="p-4 text-secondary-500">
                    {ing.expiryDate ? new Date(ing.expiryDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-4 text-secondary-500">{ing.supplier?.name || '—'}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleQuickPurchase(ing)}
                      className="mr-2 text-secondary-400 hover:text-primary-500"
                      aria-label="Restock"
                    >
                      <FiPackage size={16} />
                    </button>
                    <button onClick={() => handleDelete(ing._id)} aria-label="Remove ingredient" className="text-secondary-400 hover:text-red-500">
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddIngredientModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSaved={fetchIngredients} />
    </div>
  );
}

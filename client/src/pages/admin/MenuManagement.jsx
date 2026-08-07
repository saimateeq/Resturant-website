import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { menuService } from '@services/menuService';
import Modal from '@components/ui/Modal';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import Loader from '@components/common/Loader';

function DishFormModal({ isOpen, onClose, dish, categories, onSaved }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (isOpen) {
      reset(
        dish
          ? {
              name: dish.name,
              description: dish.description,
              category: dish.category?._id || dish.category,
              price: dish.price,
              discountPrice: dish.discountPrice,
              calories: dish.calories,
              prepTimeMinutes: dish.prepTimeMinutes,
              ingredients: dish.ingredients?.join(', '),
              isVegetarian: dish.isVegetarian,
              isVegan: dish.isVegan,
              isHalal: dish.isHalal,
              isAvailable: dish.isAvailable ?? true,
              isFeatured: dish.isFeatured,
            }
          : { isAvailable: true },
      );
      setFiles([]);
    }
  }, [isOpen, dish, reset]);

  const onSubmit = async (formData) => {
    // Only required when creating a new dish — editing keeps the existing
    // images if no new files are chosen. Without this, a dish could be
    // created with no image at all and no admin-facing error to explain why
    // (that's exactly how one live dish ended up with a blank card).
    if (!dish && files.length === 0) {
      toast.error('Add at least one image');
      return;
    }
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'ingredients') {
          value
            ?.split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .forEach((ing) => payload.append('ingredients[]', ing));
        } else if (value !== undefined && value !== '') {
          payload.append(key, value);
        }
      });
      files.forEach((file) => payload.append('images', file));

      if (dish) {
        await menuService.updateDish(dish._id, payload);
        toast.success('Dish updated');
      } else {
        await menuService.createDish(payload);
        toast.success('Dish created');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save dish');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={dish ? 'Edit Dish' : 'Add Dish'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Name" {...register('name', { required: true })} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-secondary-700 dark:text-secondary-300">
              Category
            </label>
            <select
              {...register('category', { required: true })}
              className="w-full rounded-xl border border-secondary-500/20 bg-white px-4 py-2.5 text-sm dark:bg-secondary-800 dark:text-secondary-50"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-secondary-700 dark:text-secondary-300">
            Description
          </label>
          <textarea
            rows={3}
            {...register('description', { required: true })}
            className="w-full rounded-xl border border-secondary-500/20 bg-white px-4 py-2.5 text-sm dark:bg-secondary-800 dark:text-secondary-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Input label="Price" type="number" step="0.01" {...register('price', { required: true })} />
          <Input label="Discount price" type="number" step="0.01" {...register('discountPrice')} />
          <Input label="Calories" type="number" {...register('calories')} />
          <Input label="Prep time (min)" type="number" {...register('prepTimeMinutes')} />
        </div>

        <Input label="Ingredients (comma separated)" {...register('ingredients')} />

        <div className="flex flex-wrap gap-4 text-sm">
          {[
            { key: 'isVegetarian', label: 'Vegetarian' },
            { key: 'isVegan', label: 'Vegan' },
            { key: 'isHalal', label: 'Halal' },
            { key: 'isAvailable', label: 'Available' },
            { key: 'isFeatured', label: 'Featured' },
          ].map((f) => (
            <label key={f.key} className="flex items-center gap-1.5 text-secondary-600 dark:text-secondary-300">
              <input type="checkbox" {...register(f.key)} className="rounded" />
              {f.label}
            </label>
          ))}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-secondary-700 dark:text-secondary-300">
            Images
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="text-sm"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save Dish'}
        </Button>
      </form>
    </Modal>
  );
}

function CategoryQuickAdd({ onAdded }) {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (formData) => {
    try {
      await menuService.createCategory(formData);
      toast.success('Category added');
      reset();
      onAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add category');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
      <input
        placeholder="New category name"
        {...register('name', { required: true })}
        className="flex-1 rounded-xl border border-secondary-500/20 bg-white px-3 py-2 text-sm dark:bg-secondary-800 dark:text-secondary-50"
      />
      <Button type="submit" size="sm">
        <FiPlus size={14} /> Add
      </Button>
    </form>
  );
}

export default function MenuManagement() {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      menuService.getDishes({ limit: 50 }),
      menuService.getCategories({ includeInactive: true }),
    ]).then(([dishRes, catRes]) => {
      setDishes(dishRes.data.data.dishes);
      setCategories(catRes.data.data.categories);
      setLoading(false);
    });
  };

  useEffect(fetchData, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this dish?')) return;
    try {
      await menuService.deleteDish(id);
      toast.success('Dish deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete dish');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50">Menu Management</h1>
        <Button
          size="sm"
          onClick={() => {
            setEditingDish(null);
            setModalOpen(true);
          }}
        >
          <FiPlus size={14} /> Add Dish
        </Button>
      </div>

      <div className="mt-4 rounded-2xl border border-secondary-500/10 bg-white p-4 dark:bg-secondary-900">
        <p className="mb-2 text-sm font-medium text-secondary-700 dark:text-secondary-300">Categories</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c._id}
              className="rounded-full bg-secondary-500/10 px-3 py-1 text-xs text-secondary-600 dark:text-secondary-300"
            >
              {c.name}
            </span>
          ))}
        </div>
        <div className="mt-3 max-w-sm">
          <CategoryQuickAdd onAdded={fetchData} />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-secondary-500/10 bg-white dark:bg-secondary-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-secondary-500/10 text-secondary-500">
            <tr>
              <th className="p-4">Dish</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish) => (
              <tr key={dish._id} className="border-b border-secondary-500/5">
                <td className="flex items-center gap-3 p-4">
                  <div className="h-10 w-10 overflow-hidden rounded-lg bg-secondary-100 dark:bg-secondary-800">
                    {dish.images?.[0]?.url && (
                      <img src={dish.images[0].url} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <span className="font-medium text-secondary-900 dark:text-secondary-50">{dish.name}</span>
                </td>
                <td className="p-4 text-secondary-500">{dish.category?.name}</td>
                <td className="p-4 text-secondary-900 dark:text-secondary-50">${dish.price.toFixed(2)}</td>
                <td className="p-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      dish.isAvailable ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                    }`}
                  >
                    {dish.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => {
                      setEditingDish(dish);
                      setModalOpen(true);
                    }}
                    aria-label="Edit dish"
                    className="mr-2 text-secondary-400 hover:text-primary-500"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(dish._id)} aria-label="Delete dish" className="text-secondary-400 hover:text-red-500">
                    <FiTrash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DishFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        dish={editingDish}
        categories={categories}
        onSaved={fetchData}
      />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { menuService } from '@services/menuService';
import { useDebounce } from '@hooks/useDebounce';
import DishCard from '@components/menu/DishCard';
import MenuFilters from '@components/menu/MenuFilters';
import SkeletonCard from '@components/common/SkeletonCard';
import Pagination from '@components/common/Pagination';
import { useSEO } from '@hooks/useSEO';

const DEFAULT_FILTERS = {
  search: '',
  category: '',
  vegetarian: false,
  vegan: false,
  halal: false,
  minPrice: '',
  maxPrice: '',
  sort: 'newest',
  page: 1,
};

export default function Menu() {
  useSEO({
    title: 'Menu',
    description: 'Browse Savoria\'s full menu — search, filter by category, price, and dietary needs.',
  });

  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    category: searchParams.get('category') || '',
  });

  const debouncedSearch = useDebounce(filters.search, 400);

  useEffect(() => {
    menuService.getCategories().then(({ data }) => setCategories(data.data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {
      search: debouncedSearch || undefined,
      category: filters.category || undefined,
      vegetarian: filters.vegetarian || undefined,
      vegan: filters.vegan || undefined,
      halal: filters.halal || undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
      sort: filters.sort,
      page: filters.page,
      limit: 12,
    };

    menuService
      .getDishes(params)
      .then(({ data }) => {
        setDishes(data.data.dishes);
        setPagination(data.data.pagination);
      })
      .catch(() => setDishes([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearch,
    filters.category,
    filters.vegetarian,
    filters.vegan,
    filters.halal,
    filters.minPrice,
    filters.maxPrice,
    filters.sort,
    filters.page,
  ]);

  return (
    <div className="container-app py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-secondary-900 dark:text-secondary-50">Our Menu</h1>
        <p className="mt-3 text-secondary-500 dark:text-secondary-400">
          Crafted dishes made from the finest, freshest ingredients
        </p>
      </motion.div>

      <div className="mt-10">
        <MenuFilters categories={categories} filters={filters} onChange={setFilters} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : dishes.map((dish) => <DishCard key={dish._id} dish={dish} />)}
      </div>

      {!loading && dishes.length === 0 && (
        <p className="mt-16 text-center text-secondary-500 dark:text-secondary-400">
          No dishes match your filters. Try adjusting your search.
        </p>
      )}

      <Pagination
        page={filters.page}
        totalPages={pagination.totalPages}
        onChange={(page) => setFilters((prev) => ({ ...prev, page }))}
      />
    </div>
  );
}

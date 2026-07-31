import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { menuService } from '@services/menuService';
import Reveal from '@components/common/Reveal';
import DishCard from '@components/menu/DishCard';
import SkeletonCard from '@components/common/SkeletonCard';

export default function FeaturedDishes() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    menuService
      .getDishes({ featured: 'true', limit: 4 })
      .then(({ data }) => setDishes(data.data.dishes))
      .catch(() => setDishes([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && dishes.length === 0) return null;

  return (
    <section className="container-app py-24">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-sm font-semibold tracking-widest text-primary-600 uppercase dark:text-primary-400">
            Handpicked for You
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-secondary-900 sm:text-4xl dark:text-secondary-50">
            Featured Dishes
          </h2>
        </div>
        <Link to="/menu" className="flex items-center gap-2 font-medium text-primary-600 dark:text-primary-400">
          View full menu <FiArrowRight />
        </Link>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : dishes.map((dish) => <DishCard key={dish._id} dish={dish} />)}
      </div>
    </section>
  );
}

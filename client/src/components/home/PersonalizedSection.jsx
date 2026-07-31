import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Reveal from '@components/common/Reveal';
import DishCard from '@components/menu/DishCard';
import { recommendationService } from '@services/recommendationService';
import { getRecentlyViewed } from '@hooks/useRecentlyViewed';

function DishRow({ title, subtitle, dishes }) {
  if (!dishes || dishes.length === 0) return null;

  return (
    <Reveal className="container-app py-16">
      <div>
        <span className="text-sm font-semibold tracking-widest text-primary-600 uppercase dark:text-primary-400">
          {subtitle}
        </span>
        <h2 className="mt-2 font-display text-2xl font-bold text-secondary-900 sm:text-3xl dark:text-secondary-50">
          {title}
        </h2>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {dishes.slice(0, 4).map((dish) => (
          <DishCard key={dish._id} dish={dish} />
        ))}
      </div>
    </Reveal>
  );
}

export default function PersonalizedSection() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [recommended, setRecommended] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed());

    if (isAuthenticated) {
      recommendationService
        .getForYou()
        .then(({ data }) => setRecommended(data.data.dishes))
        .catch(() => setRecommended([]));
    }
  }, [isAuthenticated]);

  return (
    <>
      <DishRow title="Recommended For You" subtitle="Just for You" dishes={recommended} />
      <DishRow title="Recently Viewed" subtitle="Pick Up Where You Left Off" dishes={recentlyViewed} />
    </>
  );
}

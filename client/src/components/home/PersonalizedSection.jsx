import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Reveal from '@components/common/Reveal';
import DishCard from '@components/menu/DishCard';
import { recommendationService } from '@services/recommendationService';
import { getRecentlyViewed } from '@hooks/useRecentlyViewed';

function DishRow({ title, subtitle, dishes }) {
  if (!dishes || dishes.length === 0) return null;

  return (
    <Reveal className="container-app bg-cream py-16">
      <div>
        <span className="eyebrow">{subtitle}</span>
        <h2 className="mt-3 font-display text-2xl font-medium text-ink italic sm:text-3xl">{title}</h2>
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

import { useEffect, useState } from 'react';
import { userService } from '@services/userService';
import DishCard from '@components/menu/DishCard';
import Loader from '@components/common/Loader';

export default function Wishlist() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService
      .getWishlist()
      .then(({ data }) => setDishes(data.data.wishlist))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullScreen={false} />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50">My Wishlist</h1>

      {dishes.length === 0 ? (
        <p className="mt-6 text-secondary-500">Your wishlist is empty. Tap the heart icon on any dish to save it.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {dishes.map((dish) => (
            <DishCard key={dish._id} dish={dish} />
          ))}
        </div>
      )}
    </div>
  );
}

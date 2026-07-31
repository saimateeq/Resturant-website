import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import {
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiStar,
  FiClock,
  FiFacebook,
  FiTwitter,
  FiLink,
  FiHeart,
} from 'react-icons/fi';
import { menuService } from '@services/menuService';
import { addToCart } from '@redux/slices/cartSlice';
import { useWishlist } from '@hooks/useWishlist';
import { trackRecentlyViewed } from '@hooks/useRecentlyViewed';
import { useSEO } from '@hooks/useSEO';
import cn from '@utils/cn';
import Loader from '@components/common/Loader';
import DishCard from '@components/menu/DishCard';
import ReviewSection from '@components/menu/ReviewSection';

export default function DishDetails() {
  const { dishId: slug } = useParams();
  const dispatch = useDispatch();
  const { isWishlisted, toggle } = useWishlist();
  const [dish, setDish] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setActiveImage(0);
    setQuantity(1);
    menuService
      .getDish(slug)
      .then(({ data }) => {
        setDish(data.data.dish);
        setRelated(data.data.related);
        trackRecentlyViewed(data.data.dish);
      })
      .catch(() => setDish(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useSEO({
    title: dish?.name,
    description: dish?.description,
    image: dish?.images?.[0]?.url,
    type: 'product',
  });

  if (loading) return <Loader />;

  if (!dish) {
    return (
      <div className="container-app py-24 text-center">
        <p className="text-secondary-500 dark:text-secondary-400">Dish not found.</p>
        <Link to="/menu" className="mt-4 inline-block text-primary-600 dark:text-primary-400">
          Back to menu
        </Link>
      </div>
    );
  }

  const price = dish.discountPrice && dish.discountPrice < dish.price ? dish.discountPrice : dish.price;

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        dishId: dish._id,
        name: dish.name,
        price,
        image: dish.images?.[0]?.url,
        quantity,
      }),
    );
    toast.success(`${quantity} × ${dish.name} added to cart`);
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="container-app py-16">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <div className="aspect-square overflow-hidden rounded-3xl bg-secondary-100 dark:bg-secondary-800">
            {dish.images?.[activeImage]?.url ? (
              <img
                src={dish.images[activeImage].url}
                alt={dish.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-secondary-300">
                <FiShoppingBag size={48} />
              </div>
            )}
          </div>
          {dish.images?.length > 1 && (
            <div className="mt-4 flex gap-3">
              {dish.images.map((img, idx) => (
                <button
                  key={img._id || idx}
                  onClick={() => setActiveImage(idx)}
                  aria-label={`View image ${idx + 1} of ${dish.name}`}
                  className={`h-16 w-16 overflow-hidden rounded-xl border-2 ${
                    idx === activeImage ? 'border-primary-500' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <p className="text-sm font-medium text-primary-600 uppercase dark:text-primary-400">
            {dish.category?.name}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-secondary-900 dark:text-secondary-50">
            {dish.name}
          </h1>

          <div className="mt-3 flex items-center gap-4 text-sm text-secondary-500 dark:text-secondary-400">
            <span className="flex items-center gap-1">
              <FiStar className="fill-primary-500 text-primary-500" /> {dish.ratingsAverage?.toFixed(1) || 'New'}{' '}
              ({dish.ratingsCount || 0} reviews)
            </span>
            {dish.prepTimeMinutes && (
              <span className="flex items-center gap-1">
                <FiClock /> {dish.prepTimeMinutes} min
              </span>
            )}
          </div>

          <p className="mt-4 text-secondary-600 dark:text-secondary-300">{dish.description}</p>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              ${price?.toFixed(2)}
            </span>
            {dish.discountPrice && dish.discountPrice < dish.price && (
              <span className="text-lg text-secondary-400 line-through">${dish.price.toFixed(2)}</span>
            )}
          </div>

          {dish.ingredients?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-secondary-900 dark:text-secondary-50">Ingredients</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {dish.ingredients.map((ing) => (
                  <span
                    key={ing}
                    className="rounded-full bg-secondary-500/10 px-3 py-1 text-xs text-secondary-600 dark:text-secondary-300"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {dish.calories || dish.nutrition?.protein ? (
            <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-secondary-500/5 p-4 text-center sm:grid-cols-5">
              {dish.calories && (
                <div>
                  <p className="text-lg font-bold text-secondary-900 dark:text-secondary-50">{dish.calories}</p>
                  <p className="text-xs text-secondary-500">Calories</p>
                </div>
              )}
              {['protein', 'carbs', 'fat', 'fiber'].map(
                (key) =>
                  dish.nutrition?.[key] != null && (
                    <div key={key}>
                      <p className="text-lg font-bold text-secondary-900 dark:text-secondary-50">
                        {dish.nutrition[key]}g
                      </p>
                      <p className="text-xs text-secondary-500 capitalize">{key}</p>
                    </div>
                  ),
              )}
            </div>
          ) : null}

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-secondary-500/20">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-3 text-secondary-600 dark:text-secondary-300"
                aria-label="Decrease quantity"
              >
                <FiMinus size={14} />
              </button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-3 text-secondary-600 dark:text-secondary-300"
                aria-label="Increase quantity"
              >
                <FiPlus size={14} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn-gradient flex flex-1 items-center justify-center gap-2 rounded-full py-3 font-medium"
            >
              <FiShoppingBag /> Add to Cart
            </button>

            <button
              onClick={() => toggle(dish._id)}
              aria-label="Toggle wishlist"
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-secondary-500/20 text-secondary-600 dark:text-secondary-300"
            >
              <FiHeart size={18} className={cn(isWishlisted(dish._id) && 'fill-primary-500 text-primary-500')} />
            </button>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <span className="text-sm text-secondary-500">Share:</span>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-500/10 text-secondary-600 dark:text-secondary-300"
            >
              <FiFacebook size={14} />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-500/10 text-secondary-600 dark:text-secondary-300"
            >
              <FiTwitter size={14} />
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                toast.success('Link copied');
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-500/10 text-secondary-600 dark:text-secondary-300"
            >
              <FiLink size={14} />
            </button>
          </div>
        </motion.div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold text-secondary-900 dark:text-secondary-50">
            You might also like
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((d) => (
              <DishCard key={d._id} dish={d} />
            ))}
          </div>
        </div>
      )}

      <ReviewSection dishId={dish._id} />
    </div>
  );
}

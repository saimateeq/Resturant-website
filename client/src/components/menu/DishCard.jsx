import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiShoppingBag, FiClock, FiHeart } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { addToCart } from '@redux/slices/cartSlice';
import { useWishlist } from '@hooks/useWishlist';
import cn from '@utils/cn';

export default function DishCard({ dish }) {
  const dispatch = useDispatch();
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(dish._id);
  const price = dish.discountPrice && dish.discountPrice < dish.price ? dish.discountPrice : dish.price;
  const hasDiscount = dish.discountPrice && dish.discountPrice < dish.price;

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    toggle(dish._id);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(
      addToCart({
        dishId: dish._id,
        name: dish.name,
        price,
        image: dish.images?.[0]?.url,
        quantity: 1,
      }),
    );
    toast.success(`${dish.name} added to cart`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -6 }}
      className="group overflow-hidden rounded-2xl border border-secondary-500/10 bg-white shadow-soft dark:bg-secondary-900"
    >
      <Link to={`/menu/${dish.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary-100 dark:bg-secondary-800">
          {dish.images?.[0]?.url ? (
            <img
              src={dish.images[0].url}
              alt={dish.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-secondary-300">
              <FiShoppingBag size={32} />
            </div>
          )}
          {hasDiscount && (
            <span className="absolute top-3 left-3 rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white">
              Sale
            </span>
          )}
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-secondary-900 dark:bg-secondary-900/90 dark:text-secondary-50">
            <FiStar className="fill-primary-500 text-primary-500" size={12} />
            {dish.ratingsAverage?.toFixed(1) || 'New'}
          </div>
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label="Toggle wishlist"
            className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-secondary-700 dark:bg-secondary-900/90 dark:text-secondary-200"
          >
            <FiHeart size={14} className={cn(wishlisted && 'fill-primary-500 text-primary-500')} />
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-display text-lg font-semibold text-secondary-900 dark:text-secondary-50">
            {dish.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-secondary-500 dark:text-secondary-400">
            {dish.description}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                ${price?.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-secondary-400 line-through">
                  ${dish.price.toFixed(2)}
                </span>
              )}
            </div>
            {dish.prepTimeMinutes && (
              <span className="flex items-center gap-1 text-xs text-secondary-400">
                <FiClock size={12} /> {dish.prepTimeMinutes}m
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={handleAddToCart}
          className="btn-gradient flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium"
        >
          <FiShoppingBag size={14} /> Add to Cart
        </button>
      </div>
    </motion.div>
  );
}

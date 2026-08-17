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
      <div className="bg-cream py-24 text-center">
        <p className="font-body text-sm text-ink/50">Dish not found.</p>
        <Link to="/menu" className="mt-4 inline-block font-body text-sm text-gold">
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
    <div className="bg-cream py-24 sm:py-32">
      <div className="container-app">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <div className="aspect-square overflow-hidden bg-ink/5">
              {dish.images?.[activeImage]?.url ? (
                <img
                  src={dish.images[activeImage].url}
                  alt={dish.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-ink/20">
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
                    className={`h-16 w-16 overflow-hidden border-2 ${
                      idx === activeImage ? 'border-gold' : 'border-transparent'
                    }`}
                  >
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <span className="eyebrow">{dish.category?.name}</span>
            <h1 className="mt-4 font-display text-3xl text-ink italic sm:text-4xl">{dish.name}</h1>

            <div className="mt-4 flex items-center gap-4 font-body text-sm text-ink/55">
              <span className="flex items-center gap-1">
                <FiStar className="fill-gold text-gold" /> {dish.ratingsAverage?.toFixed(1) || 'New'} (
                {dish.ratingsCount || 0} reviews)
              </span>
              {dish.prepTimeMinutes && (
                <span className="flex items-center gap-1">
                  <FiClock /> {dish.prepTimeMinutes} min
                </span>
              )}
            </div>

            <p className="mt-4 font-body text-ink/65">{dish.description}</p>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-display text-3xl text-gold">${price?.toFixed(2)}</span>
              {dish.discountPrice && dish.discountPrice < dish.price && (
                <span className="font-body text-lg text-ink/35 line-through">${dish.price.toFixed(2)}</span>
              )}
            </div>

            {dish.ingredients?.length > 0 && (
              <div className="mt-6">
                <h3 className="font-body text-xs font-semibold tracking-[0.1em] text-ink/50 uppercase">
                  Ingredients
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {dish.ingredients.map((ing) => (
                    <span
                      key={ing}
                      className="border border-ink/15 px-3 py-1 font-body text-xs text-ink/60"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {dish.calories || dish.nutrition?.protein ? (
              <div className="mt-6 grid grid-cols-3 gap-3 border border-ink/10 p-4 text-center sm:grid-cols-5">
                {dish.calories && (
                  <div>
                    <p className="font-display text-lg text-ink">{dish.calories}</p>
                    <p className="font-body text-xs text-ink/50">Calories</p>
                  </div>
                )}
                {['protein', 'carbs', 'fat', 'fiber'].map(
                  (key) =>
                    dish.nutrition?.[key] != null && (
                      <div key={key}>
                        <p className="font-display text-lg text-ink">{dish.nutrition[key]}g</p>
                        <p className="font-body text-xs text-ink/50 capitalize">{key}</p>
                      </div>
                    ),
                )}
              </div>
            ) : null}

            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center border border-ink/15">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 text-ink/60 hover:text-ink"
                  aria-label="Decrease quantity"
                >
                  <FiMinus size={14} />
                </button>
                <span className="w-8 text-center font-body font-medium text-ink">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-3 text-ink/60 hover:text-ink"
                  aria-label="Increase quantity"
                >
                  <FiPlus size={14} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex min-h-[44px] flex-1 items-center justify-center gap-2 border border-ink bg-ink font-body text-xs font-semibold tracking-[0.1em] text-cream uppercase transition-colors hover:bg-espresso"
              >
                <FiShoppingBag /> Add to Cart
              </button>

              <button
                onClick={() => toggle(dish._id)}
                aria-label="Toggle wishlist"
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center border border-ink/15 text-ink/60 hover:border-ink/40"
              >
                <FiHeart size={18} className={cn(isWishlisted(dish._id) && 'fill-gold text-gold')} />
              </button>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <span className="font-body text-sm text-ink/50">Share:</span>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 text-ink/60 hover:border-ink/40"
              >
                <FiFacebook size={14} />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 text-ink/60 hover:border-ink/40"
              >
                <FiTwitter size={14} />
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  toast.success('Link copied');
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 text-ink/60 hover:border-ink/40"
              >
                <FiLink size={14} />
              </button>
            </div>
          </motion.div>
        </div>

        {related.length > 0 && (
          <div className="mt-24 border-t border-ink/10 pt-16">
            <span className="eyebrow">You Might Also Like</span>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((d) => (
                <DishCard key={d._id} dish={d} />
              ))}
            </div>
          </div>
        )}

        <ReviewSection dishId={dish._id} />
      </div>
    </div>
  );
}

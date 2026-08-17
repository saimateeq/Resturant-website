import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { menuService } from '@services/menuService';
import Reveal from '@components/common/Reveal';
import { useCursorLabel } from '@components/common/CustomCursor';

export default function FeaturedDishes() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollerRef = useRef(null);

  useEffect(() => {
    menuService
      .getDishes({ featured: 'true', limit: 8 })
      .then(({ data }) => setDishes(data.data.dishes))
      .catch(() => setDishes([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && dishes.length === 0) return null;

  const scrollByAmount = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <section className="bg-cream-dim py-28 sm:py-36">
      <div className="container-app">
        <Reveal className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <span className="eyebrow">From Our Menu</span>
            <h2 className="mt-5 font-display text-4xl leading-[1.1] font-medium text-ink italic sm:text-5xl">
              Seasonal favorites
              <br />
              from our kitchen.
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/menu"
              className="font-body text-xs font-semibold tracking-[0.1em] text-ink/70 uppercase transition-colors hover:text-ink"
            >
              View full menu
            </Link>
            <div className="hidden gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scrollByAmount(-1)}
                aria-label="Scroll to previous dishes"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink"
              >
                <FiArrowLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollByAmount(1)}
                aria-label="Scroll to next dishes"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink"
              >
                <FiArrowRight size={16} />
              </button>
            </div>
          </div>
        </Reveal>

        <div
          ref={scrollerRef}
          className="mt-14 flex snap-x snap-mandatory gap-8 overflow-x-auto scroll-smooth pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <ShowcaseSkeleton key={i} />)
            : dishes.map((dish, i) => <MenuShowcaseItem key={dish._id} dish={dish} index={i} />)}
        </div>
      </div>
    </section>
  );
}

function MenuShowcaseItem({ dish, index }) {
  const price = dish.discountPrice && dish.discountPrice < dish.price ? dish.discountPrice : dish.price;
  const setCursor = useCursorLabel();

  return (
    <Link
      to={`/menu/${dish.slug}`}
      onMouseEnter={() => setCursor('View')}
      onMouseLeave={() => setCursor('')}
      className="group w-[78vw] shrink-0 snap-start sm:w-[46%] lg:w-[31%]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-ink/5">
        <span className="absolute top-4 left-4 z-10 font-display text-sm text-cream/90 italic drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
          {String(index + 1).padStart(2, '0')}
        </span>
        {dish.images?.[0]?.url ? (
          <img
            src={dish.images[0].url}
            alt={dish.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink/20">
            <FiShoppingBag size={32} />
          </div>
        )}
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <h3 className="font-display text-2xl text-ink italic">{dish.name}</h3>
        <span className="shrink-0 font-display text-lg text-gold">${price?.toFixed(2)}</span>
      </div>
      <p className="mt-1.5 line-clamp-2 max-w-[34ch] font-body text-sm text-ink/55">
        {dish.description}
      </p>
      <span className="mt-3 inline-flex items-center gap-2 font-body text-[11px] font-semibold tracking-[0.1em] text-ink/70 uppercase">
        View Dish
        <FiArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function ShowcaseSkeleton() {
  return (
    <div className="w-[78vw] shrink-0 snap-start sm:w-[46%] lg:w-[31%]">
      <div className="skeleton aspect-[4/5] w-full" />
      <div className="skeleton mt-5 h-6 w-2/3" />
      <div className="skeleton mt-2 h-4 w-full" />
    </div>
  );
}

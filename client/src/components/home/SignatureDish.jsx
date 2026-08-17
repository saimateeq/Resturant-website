import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { menuService } from '@services/menuService';
import Reveal from '@components/common/Reveal';
import { imageReveal } from '@animations/variants';
import { useCursorLabel } from '@components/common/CustomCursor';

export default function SignatureDish() {
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const setCursor = useCursorLabel();

  useEffect(() => {
    menuService
      .getDishes({ featured: 'true', limit: 1 })
      .then(({ data }) => setDish(data.data.dishes[0] || null))
      .catch(() => setDish(null))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && !dish) return null;

  const price = dish && (dish.discountPrice && dish.discountPrice < dish.price ? dish.discountPrice : dish.price);

  return (
    <section className="bg-cream py-28 sm:py-36">
      <div className="container-app">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-4">
            <span className="eyebrow">Signature Dish</span>
            <h2 className="mt-5 font-display text-4xl leading-[1.1] font-medium text-ink italic sm:text-5xl">
              The dish that defines Savoria.
            </h2>
          </Reveal>

          <Reveal variants={imageReveal} className="lg:col-span-8 lg:col-start-6">
            {dish ? (
              <div
                onMouseEnter={() => setCursor('View')}
                onMouseLeave={() => setCursor('')}
                className="aspect-[16/10] w-full overflow-hidden bg-ink/5 sm:aspect-[16/9]"
              >
                {dish.images?.[0]?.url && (
                  <img
                    src={dish.images[0].url}
                    alt={dish.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            ) : (
              <div className="skeleton aspect-[16/10] w-full sm:aspect-[16/9]" />
            )}
          </Reveal>
        </div>

        <Reveal className="mt-10 flex flex-col items-start justify-between gap-8 border-t border-ink/10 pt-8 sm:flex-row sm:items-end">
          {dish ? (
            <>
              <div>
                <h3 className="font-display text-3xl text-ink italic">{dish.name}</h3>
                <p className="mt-2 max-w-md font-body text-sm text-ink/60">{dish.description}</p>
              </div>
              <div className="flex items-center gap-8">
                <span className="font-display text-2xl text-gold">${price?.toFixed(2)}</span>
                <Link
                  to={`/menu/${dish.slug}`}
                  className="inline-flex items-center gap-2 border-b border-ink pb-1 font-body text-xs font-semibold tracking-[0.1em] text-ink uppercase transition-colors hover:border-gold hover:text-gold"
                >
                  Discover the Dish <FiArrowRight size={12} />
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="w-full max-w-md">
                <div className="skeleton h-8 w-2/3" />
                <div className="skeleton mt-3 h-4 w-full" />
              </div>
              <div className="skeleton h-8 w-32" />
            </>
          )}
        </Reveal>
      </div>
    </section>
  );
}

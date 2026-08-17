import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import Reveal from '@components/common/Reveal';
import MasonryGallery from '@components/gallery/MasonryGallery';
import { menuService } from '@services/menuService';

export default function FoodGallery() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    menuService
      .getDishes({ limit: 6, sort: 'popular' })
      .then(({ data }) =>
        setImages(data.data.dishes.filter((d) => d.images?.[0]?.url).map((d) => ({ url: d.images[0].url, name: d.name }))),
      )
      .catch(() => setImages([]));
  }, []);

  if (images.length === 0) return null;

  return (
    <section className="bg-cream-dim py-28 sm:py-36">
      <div className="container-app">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="eyebrow">Gallery</span>
            <h2 className="mt-5 font-display text-4xl leading-[1.1] font-medium text-ink italic sm:text-5xl">
              From Our Kitchen
            </h2>
          </div>
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 font-body text-xs font-semibold tracking-[0.1em] text-ink uppercase transition-colors hover:text-gold"
          >
            View Full Gallery <FiArrowRight size={13} />
          </Link>
        </Reveal>

        <div className="mt-14">
          <MasonryGallery images={images} />
        </div>
      </div>
    </section>
  );
}

import { useEffect, useState } from 'react';
import Reveal from '@components/common/Reveal';
import MasonryGallery from '@components/gallery/MasonryGallery';
import { menuService } from '@services/menuService';
import { useSEO } from '@hooks/useSEO';

export default function Gallery() {
  useSEO({
    title: 'Gallery',
    description: 'A look inside Savoria — dishes, plating, and the kitchen at work.',
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    menuService
      .getDishes({ limit: 24, sort: 'popular' })
      .then(({ data }) =>
        setImages(data.data.dishes.filter((d) => d.images?.[0]?.url).map((d) => ({ url: d.images[0].url, name: d.name }))),
      )
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-cream py-24 sm:py-32">
      <div className="container-app">
        <Reveal className="text-center">
          <span className="eyebrow">Gallery</span>
          <h1 className="mt-5 font-display text-4xl leading-[1.1] font-medium text-ink italic sm:text-5xl">
            From Our Kitchen
          </h1>
          <p className="mx-auto mt-4 max-w-md font-body text-sm text-ink/60">
            A closer look at what leaves the pass — plating, ingredients, and the dishes our guests
            come back for.
          </p>
        </Reveal>

        <div className="mt-16">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton aspect-square" />
              ))}
            </div>
          ) : images.length > 0 ? (
            <MasonryGallery images={images} />
          ) : (
            <p className="text-center font-body text-sm text-ink/50">
              No gallery images yet — check back soon.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

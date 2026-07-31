import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Reveal from '@components/common/Reveal';
import { menuService } from '@services/menuService';

export default function FoodGallery() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    menuService
      .getDishes({ limit: 8, sort: 'popular' })
      .then(({ data }) =>
        setImages(data.data.dishes.filter((d) => d.images?.[0]?.url).map((d) => ({ url: d.images[0].url, name: d.name }))),
      )
      .catch(() => setImages([]));
  }, []);

  if (images.length === 0) return null;

  return (
    <section className="container-app py-24">
      <Reveal className="text-center">
        <span className="text-sm font-semibold tracking-widest text-primary-600 uppercase dark:text-primary-400">
          Gallery
        </span>
        <h2 className="mt-3 font-display text-3xl font-bold text-secondary-900 sm:text-4xl dark:text-secondary-50">
          From Our Kitchen
        </h2>
      </Reveal>

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {images.map((img, i) => (
          <motion.div
            key={img.url}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className={`overflow-hidden rounded-2xl bg-secondary-100 dark:bg-secondary-800 ${
              i % 5 === 0 ? 'row-span-2 aspect-square sm:aspect-auto sm:h-full' : 'aspect-square'
            }`}
          >
            <img
              src={img.url}
              alt={img.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

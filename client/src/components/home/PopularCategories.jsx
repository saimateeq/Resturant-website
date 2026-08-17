import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '@components/common/Reveal';
import { staggerContainer, scaleIn } from '@animations/variants';
import { motion } from 'framer-motion';
import { menuService } from '@services/menuService';

export default function PopularCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    menuService
      .getCategories()
      .then(({ data }) => setCategories(data.data.categories.slice(0, 6)))
      .catch(() => setCategories([]));
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="bg-cream py-24 sm:py-32">
      <div className="container-app">
        <Reveal className="text-center">
          <span className="eyebrow">Explore</span>
          <h2 className="mt-5 font-display text-4xl leading-[1.1] font-medium text-ink italic sm:text-5xl">
            Popular Categories
          </h2>
        </Reveal>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
        >
          {categories.map((cat) => (
            <motion.div key={cat._id} variants={scaleIn}>
              <Link
                to={`/menu?category=${cat._id}`}
                className="group flex flex-col items-center gap-3 border border-ink/10 p-6 text-center transition-colors hover:border-gold"
              >
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gold/10 font-display text-2xl text-gold">
                  {cat.image?.url ? (
                    <img
                      src={cat.image.url}
                      alt={cat.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    cat.name.charAt(0)
                  )}
                </div>
                <span className="font-body text-sm font-medium text-ink/80">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

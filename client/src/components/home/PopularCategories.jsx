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
    <section className="bg-secondary-50 py-24 dark:bg-secondary-950">
      <div className="container-app">
        <Reveal className="text-center">
          <span className="text-sm font-semibold tracking-widest text-primary-600 uppercase dark:text-primary-400">
            Explore
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-secondary-900 sm:text-4xl dark:text-secondary-50">
            Popular Categories
          </h2>
        </Reveal>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
        >
          {categories.map((cat) => (
            <motion.div key={cat._id} variants={scaleIn}>
              <Link
                to={`/menu?category=${cat._id}`}
                className="group flex flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center shadow-soft transition-transform hover:-translate-y-1 dark:bg-secondary-900"
              >
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary-500/10 text-2xl font-display font-bold text-primary-500">
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
                <span className="text-sm font-medium text-secondary-700 dark:text-secondary-200">
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

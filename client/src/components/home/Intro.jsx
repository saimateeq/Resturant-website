import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import Reveal from '@components/common/Reveal';
import { slideInLeft, slideInRight } from '@animations/variants';

export default function Intro() {
  return (
    <section className="container-app py-24">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <Reveal variants={slideInLeft} className="relative">
          <div className="aspect-square overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-200 to-primary-500 shadow-soft">
            <img
              src="https://loremflickr.com/900/900/chef,kitchen?lock=intro"
              alt="Chef preparing a dish in the Savoria kitchen"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 hidden rounded-2xl bg-white p-6 shadow-soft sm:block dark:bg-secondary-900">
            <p className="font-display text-3xl font-bold text-primary-600 dark:text-primary-400">15+</p>
            <p className="text-sm text-secondary-500">Years of Excellence</p>
          </div>
        </Reveal>

        <Reveal variants={slideInRight}>
          <span className="text-sm font-semibold tracking-widest text-primary-600 uppercase dark:text-primary-400">
            Our Story
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-secondary-900 sm:text-4xl dark:text-secondary-50">
            A Kitchen Built on Passion & Craft
          </h2>
          <p className="mt-4 text-secondary-600 dark:text-secondary-300">
            Every dish at Savoria tells a story — sourced from trusted local farms, prepared by chefs who
            treat cooking as an art form, and served in a space designed for connection. From intimate
            dinners to celebrations, we craft experiences that linger long after the last bite.
          </p>
          <Link
            to="/about"
            className="mt-6 inline-flex items-center gap-2 font-medium text-primary-600 dark:text-primary-400"
          >
            Learn more about us <FiArrowRight />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

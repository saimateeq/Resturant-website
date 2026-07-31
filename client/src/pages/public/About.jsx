import { FiTarget, FiEye } from 'react-icons/fi';
import Reveal from '@components/common/Reveal';
import { slideInLeft, slideInRight } from '@animations/variants';
import { useCountUp } from '@hooks/useCountUp';
import MeetChefs from '@components/home/MeetChefs';
import FoodGallery from '@components/home/FoodGallery';
import { useSEO } from '@hooks/useSEO';

const ACHIEVEMENTS = [
  { label: 'Years of Service', value: 15 },
  { label: 'Michelin Mentions', value: 3 },
  { label: 'Local Awards', value: 18 },
  { label: 'Team Members', value: 60 },
];

function AchievementCounter({ label, value }) {
  const animated = useCountUp(value, 1200);
  return (
    <div className="text-center">
      <p className="font-display text-4xl font-bold text-primary-500">{Math.floor(animated)}+</p>
      <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">{label}</p>
    </div>
  );
}

export default function About() {
  useSEO({
    title: 'About Us',
    description: 'Learn the story, mission, and team behind Savoria — a restaurant built on passion and craft.',
  });

  return (
    <div>
      <section className="bg-secondary-950 py-24 text-center">
        <div className="container-app">
          <Reveal>
            <span className="text-sm font-semibold tracking-widest text-primary-400 uppercase">
              Our Story
            </span>
            <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
              Crafted With Passion Since 2010
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-secondary-300">
              What began as a single family-run kitchen has grown into a beloved dining destination —
              without ever losing the warmth, care, and craftsmanship that started it all.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-app py-24">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
          <Reveal variants={slideInLeft} className="rounded-3xl border border-secondary-500/10 bg-white p-8 dark:bg-secondary-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-500">
              <FiTarget size={22} />
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold text-secondary-900 dark:text-secondary-50">
              Our Mission
            </h2>
            <p className="mt-3 text-secondary-600 dark:text-secondary-300">
              To create unforgettable dining experiences through exceptional food, genuine hospitality,
              and a deep respect for the ingredients and people behind every meal.
            </p>
          </Reveal>

          <Reveal variants={slideInRight} className="rounded-3xl border border-secondary-500/10 bg-white p-8 dark:bg-secondary-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-500">
              <FiEye size={22} />
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold text-secondary-900 dark:text-secondary-50">
              Our Vision
            </h2>
            <p className="mt-3 text-secondary-600 dark:text-secondary-300">
              To be the region's most cherished restaurant — a place where every guest feels like
              family, and every dish reflects our commitment to craft and community.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-secondary-50 py-20 dark:bg-secondary-950">
        <div className="container-app">
          <Reveal className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {ACHIEVEMENTS.map((a) => (
              <AchievementCounter key={a.label} {...a} />
            ))}
          </Reveal>
        </div>
      </section>

      <MeetChefs />
      <FoodGallery />
    </div>
  );
}

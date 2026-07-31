import { FiAward, FiClock, FiHeart, FiTruck } from 'react-icons/fi';
import Reveal from '@components/common/Reveal';
import { useCountUp } from '@hooks/useCountUp';

const FEATURES = [
  { icon: FiAward, title: 'Award-Winning Chefs', desc: 'Culinary talent recognized nationally.' },
  { icon: FiHeart, title: 'Fresh Ingredients', desc: 'Locally sourced, always seasonal.' },
  { icon: FiClock, title: 'Fast Service', desc: 'Quick without compromising quality.' },
  { icon: FiTruck, title: 'Reliable Delivery', desc: 'Hot, fresh, and right on time.' },
];

const STATS = [
  { label: 'Happy Customers', value: 25000 },
  { label: 'Dishes Served', value: 120000 },
  { label: 'Five-Star Reviews', value: 4800 },
  { label: 'Awards Won', value: 32 },
];

function StatCounter({ label, value }) {
  const animated = useCountUp(value, 1500);
  return (
    <div className="text-center">
      <p className="font-display text-3xl font-bold text-primary-400 sm:text-4xl">
        {Math.floor(animated).toLocaleString()}+
      </p>
      <p className="mt-1 text-sm text-secondary-300">{label}</p>
    </div>
  );
}

export default function WhyChooseUs() {
  return (
    <section className="bg-secondary-50 py-24 dark:bg-secondary-950">
      <div className="container-app">
        <Reveal className="text-center">
          <span className="text-sm font-semibold tracking-widest text-primary-600 uppercase dark:text-primary-400">
            Why Savoria
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-secondary-900 sm:text-4xl dark:text-secondary-50">
            Why Choose Us
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.1} className="rounded-2xl bg-white p-6 text-center shadow-soft dark:bg-secondary-900">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-500">
                <f.icon size={24} />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-secondary-900 dark:text-secondary-50">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">{f.desc}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-20 rounded-3xl bg-secondary-950 px-8 py-12 dark:bg-secondary-900">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {STATS.map((s) => (
              <StatCounter key={s.label} {...s} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

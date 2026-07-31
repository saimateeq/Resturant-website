import Reveal from '@components/common/Reveal';
import { FiInstagram, FiTwitter } from 'react-icons/fi';

const CHEFS = [
  { name: 'Marco Bellini', role: 'Executive Chef', initials: 'MB', photo: 'https://i.pravatar.cc/300?img=12' },
  { name: 'Amara Osei', role: 'Head Pastry Chef', initials: 'AO', photo: 'https://i.pravatar.cc/300?img=32' },
  { name: 'Kenji Watanabe', role: 'Sous Chef', initials: 'KW', photo: 'https://i.pravatar.cc/300?img=13' },
  { name: 'Elena Rossi', role: 'Sommelier', initials: 'ER', photo: 'https://i.pravatar.cc/300?img=47' },
];

export default function MeetChefs() {
  return (
    <section className="container-app py-24">
      <Reveal className="text-center">
        <span className="text-sm font-semibold tracking-widest text-primary-600 uppercase dark:text-primary-400">
          Our Team
        </span>
        <h2 className="mt-3 font-display text-3xl font-bold text-secondary-900 sm:text-4xl dark:text-secondary-50">
          Meet Our Chefs
        </h2>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CHEFS.map((chef, i) => (
          <Reveal key={chef.name} delay={i * 0.1} className="group text-center">
            <div className="relative mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary-300 to-primary-600 font-display text-3xl font-bold text-white shadow-soft">
              <span aria-hidden>{chef.initials}</span>
              <img
                src={chef.photo}
                alt={chef.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-secondary-900 dark:text-secondary-50">
              {chef.name}
            </h3>
            <p className="text-sm text-secondary-500">{chef.role}</p>
            <div className="mt-2 flex justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <FiInstagram className="text-secondary-400" size={14} />
              <FiTwitter className="text-secondary-400" size={14} />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import Reveal from '@components/common/Reveal';
import { imageReveal } from '@animations/variants';

const HEAD_CHEF = {
  name: 'Marco Bellini',
  role: 'Executive Chef',
  photo: 'https://i.pravatar.cc/800?img=12',
  quote: 'Our kitchen follows the seasons, not the trends.',
  story:
    'Marco has spent fifteen years cooking the way his grandmother taught him — start with what the farmer brought in this morning, and build from there. At Savoria, the menu changes with the produce, not the other way around.',
};

const TEAM = [
  { name: 'Marco Bellini', role: 'Executive Chef', photo: 'https://i.pravatar.cc/300?img=12' },
  { name: 'Amara Osei', role: 'Head Pastry Chef', photo: 'https://i.pravatar.cc/300?img=32' },
  { name: 'Kenji Watanabe', role: 'Sous Chef', photo: 'https://i.pravatar.cc/300?img=13' },
  { name: 'Elena Rossi', role: 'Sommelier', photo: 'https://i.pravatar.cc/300?img=47' },
];

export default function MeetChefs() {
  return (
    <section className="bg-cream py-28 sm:py-36">
      <div className="container-app">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:items-center">
          <Reveal variants={imageReveal} className="lg:col-span-5">
            <div className="aspect-[4/5] w-full overflow-hidden">
              <img
                src={HEAD_CHEF.photo}
                alt={HEAD_CHEF.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>

          <Reveal className="lg:col-span-6 lg:col-start-7">
            <span className="eyebrow">From the Kitchen</span>
            <p className="mt-6 font-display text-3xl leading-snug text-ink italic sm:text-4xl">
              &ldquo;{HEAD_CHEF.quote}&rdquo;
            </p>
            <p className="mt-6 max-w-md font-body text-[15px] leading-relaxed text-ink/60">
              {HEAD_CHEF.story}
            </p>
            <div className="mt-7">
              <p className="font-display text-lg text-ink italic">{HEAD_CHEF.name}</p>
              <p className="text-xs tracking-[0.1em] text-ink/50 uppercase">{HEAD_CHEF.role}</p>
            </div>
            <Link
              to="/about"
              className="mt-8 inline-flex items-center gap-2 font-body text-xs font-semibold tracking-[0.1em] text-ink uppercase transition-colors hover:text-gold"
            >
              Meet the Chef <FiArrowRight size={13} />
            </Link>
          </Reveal>
        </div>

        <Reveal className="mt-24 grid grid-cols-2 gap-8 border-t border-ink/10 pt-12 sm:grid-cols-4">
          {TEAM.map((member) => (
            <div key={member.name} className="text-center">
              <div className="mx-auto h-20 w-20 overflow-hidden rounded-full">
                <img
                  src={member.photo}
                  alt={member.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-3 font-display text-sm text-ink italic">{member.name}</p>
              <p className="mt-0.5 text-xs text-ink/50">{member.role}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

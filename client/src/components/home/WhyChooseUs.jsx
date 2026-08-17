import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';
import Reveal from '@components/common/Reveal';
import cn from '@utils/cn';
import produceImg from '../../assets/images/produce-flatlay.webp';
import chefImg from '../../assets/images/chef.avif';
import kitchenImg from '../../assets/images/story-kitchen-detail.webp';
import spaceImg from '../../assets/images/space-interior.webp';

const ITEMS = [
  {
    title: 'Seasonal Ingredients',
    desc: "Menus shift with the seasons, built around what's actually good right now — not a laminated menu that never changes.",
    image: produceImg,
  },
  {
    title: 'Local Producers',
    desc: 'Small farms and trusted suppliers we’ve worked with for years, sourced directly rather than through a distributor.',
    image: chefImg,
  },
  {
    title: 'Open Kitchen',
    desc: 'Nothing hidden behind a swinging door — watch every plate come together, start to finish.',
    image: kitchenImg,
  },
  {
    title: 'Thoughtful Hospitality',
    desc: 'Service that pays attention without hovering. The small details, remembered and returned.',
    image: spaceImg,
  },
];

export default function WhyChooseUs() {
  const [active, setActive] = useState(0);
  const [openMobile, setOpenMobile] = useState(0);

  return (
    <section className="bg-ink py-28 sm:py-36">
      <div className="container-app">
        <Reveal className="text-center">
          <span className="eyebrow text-gold">Why Savoria</span>
          <h2 className="mt-5 font-display text-4xl leading-[1.1] font-medium text-cream italic sm:text-5xl">
            What makes it different.
          </h2>
        </Reveal>

        {/* Desktop: hover list with a synced image panel */}
        <div className="mt-16 hidden lg:grid lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-6">
            {ITEMS.map((item, i) => (
              <button
                key={item.title}
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className="group flex w-full items-baseline gap-6 border-b border-cream/10 py-7 text-left"
              >
                <span
                  className={cn(
                    'font-display text-sm italic transition-colors duration-300',
                    active === i ? 'text-gold' : 'text-cream/30',
                  )}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className={cn(
                    'font-display text-3xl transition-all duration-300',
                    active === i ? 'translate-x-2 text-cream italic' : 'text-cream/50',
                  )}
                >
                  {item.title}
                </span>
              </button>
            ))}
          </div>

          <div className="relative aspect-[4/5] overflow-hidden lg:col-span-6">
            <AnimatePresence mode="wait">
              <motion.img
                key={ITEMS[active].image}
                src={ITEMS[active].image}
                alt={ITEMS[active].title}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full w-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-8">
              <p className="max-w-sm font-body text-sm text-cream/80">{ITEMS[active].desc}</p>
            </div>
          </div>
        </div>

        {/* Mobile: accordion */}
        <div className="mt-12 lg:hidden">
          {ITEMS.map((item, i) => {
            const isOpen = openMobile === i;
            return (
              <div key={item.title} className="border-b border-cream/10">
                <button
                  type="button"
                  onClick={() => setOpenMobile(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="flex min-h-[44px] w-full items-center justify-between gap-4 py-6 text-left"
                >
                  <span className="flex items-baseline gap-4">
                    <span className="font-display text-sm text-gold italic">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-display text-xl text-cream italic">{item.title}</span>
                  </span>
                  <FiPlus
                    size={18}
                    className={cn('shrink-0 text-cream/50 transition-transform duration-300', isOpen && 'rotate-45')}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6">
                        <div className="aspect-[16/10] w-full overflow-hidden">
                          <img src={item.image} alt={item.title} loading="lazy" className="h-full w-full object-cover" />
                        </div>
                        <p className="mt-4 font-body text-sm text-cream/70">{item.desc}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

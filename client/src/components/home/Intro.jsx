import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import Reveal from '@components/common/Reveal';
import { fadeInUp, imageReveal } from '@animations/variants';
import chef from '../../assets/images/chef.avif';
import kitchenDetail from '../../assets/images/story-kitchen-detail.webp';

export default function Intro() {
  return (
    <section className="bg-cream py-28 sm:py-36">
      <div className="container-app">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:items-center">
          <div className="relative lg:col-span-7">
            <Reveal variants={imageReveal} className="aspect-[4/5] w-full overflow-hidden">
              <img
                src={chef}
                alt="Chef preparing a dish in the Savoria kitchen"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </Reveal>
            <Reveal
              variants={imageReveal}
              delay={0.2}
              className="absolute -right-4 -bottom-12 hidden w-[42%] border-8 border-cream shadow-[0_20px_60px_-15px_rgba(23,21,18,0.35)] sm:block md:-right-10"
            >
              <img
                src={kitchenDetail}
                alt="A dish being finished in the Savoria kitchen"
                loading="lazy"
                className="aspect-[3/4] w-full object-cover"
              />
            </Reveal>
          </div>

          <Reveal variants={fadeInUp} className="lg:col-span-5 lg:pt-0 lg:pl-6">
            <span className="eyebrow">Our Story</span>
            <h2 className="mt-5 font-display text-4xl leading-[1.1] font-medium text-ink italic sm:text-5xl">
              We believe food should bring people together.
            </h2>
            <p className="mt-6 max-w-md font-body text-[15px] leading-relaxed text-ink/60">
              Every dish at Savoria tells a story — sourced from trusted local farms, prepared by
              chefs who treat cooking as an art form, and served in a space designed for
              connection. From intimate dinners to celebrations, we craft experiences that linger
              long after the last bite.
            </p>
            <Link
              to="/about"
              className="mt-8 inline-flex items-center gap-2 font-body text-xs font-semibold tracking-[0.1em] text-ink uppercase transition-colors hover:text-gold"
            >
              Learn more about us <FiArrowRight size={13} />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

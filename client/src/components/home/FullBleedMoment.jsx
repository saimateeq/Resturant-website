import Reveal from '@components/common/Reveal';
import { imageReveal } from '@animations/variants';
import wineImg from '../../assets/images/wine-pour.webp';

export default function FullBleedMoment() {
  return (
    <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden bg-ink">
      <Reveal variants={imageReveal} className="absolute inset-0 h-full w-full">
        <img
          src={wineImg}
          alt="Wine being poured at a Savoria table"
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </Reveal>
      <div className="absolute inset-0 bg-ink/35" />
      <div className="relative flex h-full items-center justify-center px-6 text-center">
        <h2 className="max-w-3xl font-display text-4xl leading-[1.15] text-cream italic sm:text-5xl lg:text-6xl">
          Good food brings us together.
        </h2>
      </div>
    </section>
  );
}

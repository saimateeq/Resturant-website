import Reveal from '@components/common/Reveal';
import { imageReveal } from '@animations/variants';
import spaceImg from '../../assets/images/space-interior.webp';

const WORDS = ['Dinner.', 'Conversation.', 'Music.', 'Memory.'];

export default function Space() {
  return (
    <section className="relative h-[85vh] min-h-[560px] w-full overflow-hidden bg-ink">
      <Reveal variants={imageReveal} className="absolute inset-0 h-full w-full">
        <img
          src={spaceImg}
          alt="The Savoria dining room in the evening"
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </Reveal>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/5" />
      <div className="relative flex h-full flex-col justify-end px-6 pb-16 sm:px-10 sm:pb-24">
        <span className="eyebrow text-gold">The Space</span>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1">
          {WORDS.map((word) => (
            <span key={word} className="font-display text-4xl text-cream italic sm:text-6xl lg:text-7xl">
              {word}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

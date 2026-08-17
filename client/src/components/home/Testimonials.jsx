import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination as SwiperPagination } from 'swiper/modules';
import { FiStar } from 'react-icons/fi';
import Reveal from '@components/common/Reveal';
import 'swiper/css';
import 'swiper/css/pagination';

const TESTIMONIALS = [
  {
    name: 'Sarah Mitchell',
    text: 'The best dining experience I have had in years. Every dish was a masterpiece, and the service was impeccable.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/80?img=5',
  },
  {
    name: 'James Carter',
    text: 'Savoria has become our go-to spot for celebrations. The ambiance and food never disappoint.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/80?img=15',
  },
  {
    name: 'Priya Nair',
    text: 'Fresh ingredients, bold flavors, and a team that genuinely cares about the guest experience.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/80?img=26',
  },
  {
    name: 'Daniel Kim',
    text: 'From reservation to dessert, everything was seamless. Highly recommend the tasting menu.',
    rating: 4,
    avatar: 'https://i.pravatar.cc/80?img=51',
  },
];

export default function Testimonials() {
  return (
    <section className="bg-ink py-24 sm:py-32">
      <div className="container-app">
        <Reveal className="text-center">
          <span className="eyebrow text-gold">Testimonials</span>
          <h2 className="mt-5 font-display text-4xl leading-[1.1] font-medium text-cream italic sm:text-5xl">
            What Our Guests Say
          </h2>
        </Reveal>

        <Reveal delay={0.15} className="mt-14">
          <Swiper
            modules={[Autoplay, SwiperPagination]}
            spaceBetween={24}
            slidesPerView={1}
            autoplay={{ delay: 5000 }}
            pagination={{ clickable: true }}
            breakpoints={{ 768: { slidesPerView: 2 }, 1280: { slidesPerView: 3 } }}
            className="pb-12"
          >
            {TESTIMONIALS.map((t) => (
              <SwiperSlide key={t.name}>
                <div className="h-full border border-cream/10 p-7">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FiStar
                        key={i}
                        size={13}
                        className={i < t.rating ? 'fill-gold text-gold' : 'text-cream/20'}
                      />
                    ))}
                  </div>
                  <p className="mt-4 font-body text-sm text-cream/70">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-5 flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      loading="lazy"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <p className="font-display text-cream italic">{t.name}</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </Reveal>
      </div>
    </section>
  );
}

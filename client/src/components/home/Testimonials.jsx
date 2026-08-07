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
    <section className="bg-secondary-950 py-24">
      <div className="container-app">
        <Reveal className="text-center">
          <span className="text-sm font-semibold tracking-widest text-primary-400 uppercase">
            Testimonials
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
            What Our Guests Say
          </h2>
        </Reveal>

        <Reveal delay={0.15} className="mt-12">
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
                <div className="h-full rounded-2xl bg-secondary-900 p-6">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FiStar
                        key={i}
                        size={14}
                        className={i < t.rating ? 'fill-primary-400 text-primary-400' : 'text-secondary-700'}
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-secondary-300">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-4 flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      loading="lazy"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <p className="font-medium text-white">{t.name}</p>
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

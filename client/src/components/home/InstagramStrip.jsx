import { useEffect, useState } from 'react';
import { FiInstagram } from 'react-icons/fi';
import Reveal from '@components/common/Reveal';
import { menuService } from '@services/menuService';

export default function InstagramStrip() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    menuService
      .getDishes({ limit: 6, sort: 'popular' })
      .then(({ data }) =>
        setImages(data.data.dishes.filter((d) => d.images?.[0]?.url).map((d) => ({ url: d.images[0].url, name: d.name }))),
      )
      .catch(() => setImages([]));
  }, []);

  if (images.length === 0) return null;

  return (
    <section className="bg-cream py-24 sm:py-32">
      <div className="container-app">
        <Reveal className="text-center">
          <span className="eyebrow">Follow the Table</span>
          <h2 className="mt-5 flex items-center justify-center gap-2.5 font-display text-3xl text-ink italic sm:text-4xl">
            <FiInstagram className="text-gold" size={26} /> @savoria
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4">
          {images.map((img) => (
            <div key={img.url} className="group relative aspect-square overflow-hidden">
              <img
                src={img.url}
                alt={img.name}
                loading="lazy"
                className="h-full w-full object-cover grayscale-[15%] transition-all duration-500 group-hover:scale-110 group-hover:grayscale-0"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors duration-300 group-hover:bg-ink/30">
                <FiInstagram
                  className="text-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  size={18}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

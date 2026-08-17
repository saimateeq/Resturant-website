import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';
import Reveal from '@components/common/Reveal';
import { slideInLeft, slideInRight } from '@animations/variants';

export default function ContactTeaser() {
  return (
    <section className="bg-cream py-24 sm:py-32">
      <div className="container-app grid grid-cols-1 gap-10 overflow-hidden border border-ink/10 lg:grid-cols-2">
        <Reveal variants={slideInLeft} className="bg-cream p-10 sm:p-14">
          <span className="eyebrow">Visit Us</span>
          <h2 className="mt-5 font-display text-3xl leading-[1.1] text-ink italic sm:text-4xl">
            We'd Love to Host You
          </h2>

          <div className="mt-9 space-y-5 font-body text-sm text-ink/60">
            <div className="flex items-start gap-3">
              <FiMapPin className="mt-0.5 text-gold" />
              <span>123 Gourmet Street, Flavor City, FC 10001</span>
            </div>
            <div className="flex items-start gap-3">
              <FiPhone className="mt-0.5 text-gold" />
              <span>+1 (555) 012-3456</span>
            </div>
            <div className="flex items-start gap-3">
              <FiMail className="mt-0.5 text-gold" />
              <span>hello@savoria.com</span>
            </div>
            <div className="flex items-start gap-3">
              <FiClock className="mt-0.5 text-gold" />
              <div>
                <p>Mon–Fri: 11:00 AM – 10:00 PM</p>
                <p>Sat–Sun: 10:00 AM – 11:00 PM</p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal variants={slideInRight} className="min-h-[320px]">
          <iframe
            title="Savoria location"
            src="https://maps.google.com/maps?q=New%20York%2C%20NY&t=&z=13&ie=UTF8&iwloc=&output=embed"
            className="h-full w-full border-0 grayscale-[20%]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </Reveal>
      </div>
    </section>
  );
}

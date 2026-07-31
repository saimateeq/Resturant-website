import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';
import Reveal from '@components/common/Reveal';
import { slideInLeft, slideInRight } from '@animations/variants';

export default function ContactTeaser() {
  return (
    <section className="container-app py-24">
      <div className="grid grid-cols-1 gap-10 overflow-hidden rounded-3xl border border-secondary-500/10 shadow-soft lg:grid-cols-2">
        <Reveal variants={slideInLeft} className="bg-white p-10 dark:bg-secondary-900">
          <span className="text-sm font-semibold tracking-widest text-primary-600 uppercase dark:text-primary-400">
            Visit Us
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-secondary-900 dark:text-secondary-50">
            We'd Love to Host You
          </h2>

          <div className="mt-8 space-y-5 text-sm text-secondary-600 dark:text-secondary-300">
            <div className="flex items-start gap-3">
              <FiMapPin className="mt-0.5 text-primary-500" />
              <span>123 Gourmet Street, Flavor City, FC 10001</span>
            </div>
            <div className="flex items-start gap-3">
              <FiPhone className="mt-0.5 text-primary-500" />
              <span>+1 (555) 012-3456</span>
            </div>
            <div className="flex items-start gap-3">
              <FiMail className="mt-0.5 text-primary-500" />
              <span>hello@savoria.com</span>
            </div>
            <div className="flex items-start gap-3">
              <FiClock className="mt-0.5 text-primary-500" />
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

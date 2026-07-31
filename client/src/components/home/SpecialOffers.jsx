import { useEffect, useState } from 'react';
import { FiTag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Reveal from '@components/common/Reveal';
import { publicService } from '@services/publicService';

export default function SpecialOffers() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    publicService
      .getActiveOffers()
      .then(({ data }) => setOffers(data.data.offers))
      .catch(() => setOffers([]));
  }, []);

  if (offers.length === 0) return null;

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied "${code}"`);
  };

  return (
    <section className="bg-secondary-50 py-24 dark:bg-secondary-950">
      <div className="container-app">
        <Reveal className="text-center">
          <span className="text-sm font-semibold tracking-widest text-primary-600 uppercase dark:text-primary-400">
            Limited Time
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-secondary-900 sm:text-4xl dark:text-secondary-50">
            Special Offers
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer, i) => (
            <Reveal key={offer._id || offer.code} delay={i * 0.1}>
              <button
                onClick={() => copyCode(offer.code)}
                className="w-full rounded-2xl border-2 border-dashed border-primary-500/40 bg-white p-6 text-left transition-colors hover:border-primary-500 dark:bg-secondary-900"
              >
                <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                  <FiTag size={16} />
                  <span className="font-display text-lg font-bold">{offer.code}</span>
                </div>
                <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-300">
                  {offer.description ||
                    (offer.type === 'percentage'
                      ? `${offer.value}% off your order`
                      : offer.type === 'flat'
                        ? `$${offer.value} off your order`
                        : 'Free delivery')}
                </p>
                <p className="mt-3 text-xs text-secondary-400">
                  Expires {new Date(offer.expiryDate).toLocaleDateString()}
                </p>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

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
    <section className="bg-cream-dim py-24 sm:py-32">
      <div className="container-app">
        <Reveal className="text-center">
          <span className="eyebrow">Limited Time</span>
          <h2 className="mt-5 font-display text-4xl leading-[1.1] font-medium text-ink italic sm:text-5xl">
            Special Offers
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer, i) => (
            <Reveal key={offer._id || offer.code} delay={i * 0.1}>
              <button
                onClick={() => copyCode(offer.code)}
                className="w-full border border-dashed border-ink/25 bg-cream p-7 text-left transition-colors hover:border-gold"
              >
                <div className="flex items-center gap-2 text-gold">
                  <FiTag size={16} />
                  <span className="font-display text-lg italic">{offer.code}</span>
                </div>
                <p className="mt-2 font-body text-sm text-ink/60">
                  {offer.description ||
                    (offer.type === 'percentage'
                      ? `${offer.value}% off your order`
                      : offer.type === 'flat'
                        ? `$${offer.value} off your order`
                        : 'Free delivery')}
                </p>
                <p className="mt-3 font-body text-xs text-ink/40">
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

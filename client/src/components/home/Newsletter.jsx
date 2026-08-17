import { useState } from 'react';
import toast from 'react-hot-toast';
import Reveal from '@components/common/Reveal';
import { publicService } from '@services/publicService';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await publicService.subscribeNewsletter(email);
      toast.success(data.message);
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not subscribe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-ink py-28 sm:py-36">
      <div className="container-app">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="eyebrow">Stay at the Table</span>
          <h2 className="mt-5 font-display text-4xl leading-[1.15] text-cream italic sm:text-5xl">
            Seasonal menus. Special dinners. New experiences.
          </h2>
          <form
            onSubmit={handleSubmit}
            className="mt-10 flex flex-col gap-4 border-b border-cream/20 pb-3 sm:flex-row sm:items-end sm:gap-3"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-[44px] flex-1 bg-transparent font-body text-cream outline-none placeholder:text-cream/40"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-[44px] items-center justify-center border border-cream/40 px-6 py-2.5 font-body text-xs font-semibold tracking-[0.1em] text-cream uppercase transition-colors hover:border-gold hover:text-gold disabled:opacity-60"
            >
              {loading ? 'Joining…' : 'Join'}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiMail } from 'react-icons/fi';
import Reveal from '@components/common/Reveal';
import { publicService } from '@services/publicService';
import Button from '@components/ui/Button';

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
    <section className="container-app py-24">
      <Reveal className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 px-8 py-14 text-center text-white shadow-soft">
        <FiMail size={32} className="mx-auto" />
        <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">Stay in the Loop</h2>
        <p className="mt-2 text-primary-100">
          Subscribe for exclusive offers, new menu launches, and event invitations.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-full border-none bg-white/95 px-5 py-3 text-sm text-secondary-900 outline-none placeholder:text-secondary-400"
          />
          <Button type="submit" variant="ghost" className="bg-secondary-950 text-white hover:bg-secondary-900" disabled={loading}>
            {loading ? 'Subscribing…' : 'Subscribe'}
          </Button>
        </form>
      </Reveal>
    </section>
  );
}

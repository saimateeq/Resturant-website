import { Link } from 'react-router-dom';
import { useSEO } from '@hooks/useSEO';

export default function NotFound() {
  useSEO({ title: 'Page Not Found' });

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-cream text-center">
      <p className="font-display text-8xl text-gold italic">404</p>
      <h1 className="mt-4 font-display text-3xl text-ink italic">Page not found</h1>
      <p className="mt-2 font-body text-sm text-ink/55">The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="mt-8 inline-flex min-h-[44px] items-center justify-center border border-ink bg-ink px-7 font-body text-xs font-semibold tracking-[0.1em] text-cream uppercase transition-colors hover:bg-espresso"
      >
        Back to Home
      </Link>
    </div>
  );
}

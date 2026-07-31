import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-app flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="font-display text-8xl font-bold text-primary-500">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-secondary-900 dark:text-secondary-50">
        Page not found
      </h1>
      <p className="mt-2 text-secondary-500 dark:text-secondary-400">
        The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="btn-gradient mt-6 rounded-full px-6 py-3 text-sm font-medium">
        Back to Home
      </Link>
    </div>
  );
}

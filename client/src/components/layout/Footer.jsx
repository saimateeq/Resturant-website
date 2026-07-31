import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiTwitter, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

const FOOTER_LINKS = [
  {
    title: 'Explore',
    links: [
      { to: '/menu', label: 'Menu' },
      { to: '/about', label: 'About Us' },
      { to: '/blog', label: 'Blog' },
      { to: '/reservations', label: 'Reservations' },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/login', label: 'Login' },
      { to: '/register', label: 'Register' },
      { to: '/dashboard', label: 'My Dashboard' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-secondary-500/10 bg-secondary-50 dark:bg-secondary-950">
      <div className="container-app grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl font-bold text-primary-600 dark:text-primary-400">
            Savoria
          </p>
          <p className="mt-3 text-sm text-secondary-500 dark:text-secondary-400">
            A premium dining experience crafted with passion, quality ingredients, and warm hospitality.
          </p>
          <div className="mt-4 flex gap-3">
            {[FiInstagram, FiFacebook, FiTwitter].map((Icon, idx) => (
              <a
                key={idx}
                href="#"
                aria-label="Social media"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-500/10 text-secondary-600 transition-colors hover:bg-primary-500 hover:text-white dark:text-secondary-300"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {FOOTER_LINKS.map((section) => (
          <div key={section.title}>
            <p className="font-display text-lg font-semibold text-secondary-900 dark:text-secondary-100">
              {section.title}
            </p>
            <ul className="mt-4 space-y-2">
              {section.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-secondary-500 transition-colors hover:text-primary-500 dark:text-secondary-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="font-display text-lg font-semibold text-secondary-900 dark:text-secondary-100">
            Contact
          </p>
          <ul className="mt-4 space-y-3 text-sm text-secondary-500 dark:text-secondary-400">
            <li className="flex items-center gap-2">
              <FiMapPin size={16} /> 123 Gourmet Street, Flavor City
            </li>
            <li className="flex items-center gap-2">
              <FiPhone size={16} /> +1 (555) 012-3456
            </li>
            <li className="flex items-center gap-2">
              <FiMail size={16} /> hello@savoria.com
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-secondary-500/10 py-6 text-center text-xs text-secondary-500 dark:text-secondary-400">
        © {new Date().getFullYear()} Savoria Restaurant. All rights reserved.
      </div>
    </footer>
  );
}

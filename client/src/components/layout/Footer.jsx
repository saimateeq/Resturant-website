import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiTwitter, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

const FOOTER_LINKS = [
  {
    title: 'Explore',
    links: [
      { to: '/menu', label: 'Menu' },
      { to: '/about', label: 'About Us' },
      { to: '/gallery', label: 'Gallery' },
      { to: '/blog', label: 'Journal' },
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
    <footer className="bg-ink py-24 sm:py-32">
      <div className="container-app">
        <div className="text-center">
          <Link to="/" className="font-display text-6xl font-medium text-cream italic sm:text-8xl">
            Savoria
          </Link>
          <p className="mt-6 font-display text-2xl text-gold italic sm:text-3xl">
            Come hungry. Leave happy.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-12 border-t border-cream/10 pt-16 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="eyebrow text-cream/50">Visit</p>
            <p className="mt-4 font-body text-sm text-cream/70">
              123 Gourmet Street
              <br />
              Flavor City, FC 10001
            </p>
            <div className="mt-6 flex gap-3">
              {[FiInstagram, FiFacebook, FiTwitter].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  aria-label="Social media"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/15 text-cream/70 transition-colors hover:border-gold hover:text-gold"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_LINKS.map((section) => (
            <div key={section.title}>
              <p className="eyebrow text-cream/50">{section.title}</p>
              <ul className="mt-4 space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="font-body text-sm text-cream/70 transition-colors hover:text-cream"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="eyebrow text-cream/50">Contact</p>
            <ul className="mt-4 space-y-2.5 font-body text-sm text-cream/70">
              <li className="flex items-center gap-2">
                <FiMapPin size={14} /> 123 Gourmet Street
              </li>
              <li className="flex items-center gap-2">
                <FiPhone size={14} /> +1 (555) 012-3456
              </li>
              <li className="flex items-center gap-2">
                <FiMail size={14} /> hello@savoria.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-cream/10 pt-8 text-center">
          <p className="font-body text-xs text-cream/40">
            © {new Date().getFullYear()} Savoria Restaurant. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

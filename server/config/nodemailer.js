import dns from 'dns';
import nodemailer from 'nodemailer';

// nodemailer resolves hostnames with its own internal `dns.Resolver()`
// instance, which reads this machine's configured (and here, unreliable)
// nameservers directly and intermittently returns loopback addresses,
// causing SMTP connections to fail with ECONNREFUSED 127.0.0.1/::1.
// `dns.lookup()` (via the OS resolver) does not have this problem on this
// network, so we resolve the IP ourselves and hand nodemailer a literal IP,
// which makes it skip its own resolution entirely. `tls.servername` keeps
// certificate validation checking against the real hostname.
const RESOLUTION_TTL_MS = 3 * 60 * 1000;
let cached = null; // { ip, expires }

async function resolveHost(hostname) {
  if (cached && cached.expires > Date.now()) return cached.ip;

  const ip = await new Promise((resolve, reject) => {
    dns.lookup(hostname, { family: 4 }, (err, address) => {
      if (err) reject(err);
      else resolve(address);
    });
  });

  cached = { ip, expires: Date.now() + RESOLUTION_TTL_MS };
  return ip;
}

export async function getTransporter() {
  const hostname = process.env.SMTP_HOST;
  const host = await resolveHost(hostname);

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: { servername: hostname },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
  });
}

import { getTransporter } from '../config/nodemailer.js';

const MAX_SEND_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function send(to, subject, html) {
  if (!process.env.SMTP_USER) {
    console.log(`[email:skipped - no SMTP configured] to=${to} subject="${subject}"`);
    return;
  }

  const mail = {
    from: process.env.EMAIL_FROM || '"Savoria Restaurant" <no-reply@savoria.com>',
    to,
    subject,
    html,
  };

  let lastError;
  for (let attempt = 1; attempt <= MAX_SEND_ATTEMPTS; attempt++) {
    try {
      const transporter = await getTransporter();
      await transporter.sendMail(mail);
      return;
    } catch (err) {
      lastError = err;
      console.error(`[email:attempt ${attempt}/${MAX_SEND_ATTEMPTS} failed] to=${to} subject="${subject}" - ${err.message}`);
      if (attempt < MAX_SEND_ATTEMPTS) await sleep(RETRY_DELAY_MS * attempt);
    }
  }
  throw lastError;
}

const wrapper = (title, body) => `
  <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #17171b;">
    <h1 style="font-family: Georgia, serif; color: #b87a17; font-size: 24px;">Savoria</h1>
    <h2 style="font-size: 18px;">${title}</h2>
    ${body}
    <p style="margin-top: 32px; font-size: 12px; color: #767786;">If you didn't request this, you can safely ignore this email.</p>
  </div>
`;

export function sendOtpEmail(to, otp) {
  return send(
    to,
    'Verify your email — Savoria',
    wrapper(
      'Verify your email address',
      `<p>Your verification code is:</p>
       <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px;">${otp}</p>
       <p>This code expires in 5 minutes. After 3 incorrect attempts, you'll need to request a new one.</p>`,
    ),
  );
}

export function sendPasswordResetEmail(to, resetUrl) {
  return send(
    to,
    'Reset your password — Savoria',
    wrapper(
      'Reset your password',
      `<p>Click the button below to reset your password. This link expires in 30 minutes.</p>
       <a href="${resetUrl}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #b87a17; color: white; text-decoration: none; border-radius: 999px;">Reset Password</a>`,
    ),
  );
}

export function sendReservationStatusEmail(to, reservation) {
  const statusLabel = reservation.status === 'approved' ? 'confirmed' : reservation.status;
  return send(
    to,
    `Your reservation is ${statusLabel} — Savoria`,
    wrapper(
      `Reservation ${statusLabel}`,
      `<p>Date: ${new Date(reservation.date).toDateString()}</p>
       <p>Time: ${reservation.time}</p>
       <p>Guests: ${reservation.guests}</p>`,
    ),
  );
}

export function sendOrderConfirmationEmail(to, order) {
  return send(
    to,
    `Order confirmed #${order.orderNumber} — Savoria`,
    wrapper(
      'Thanks for your order!',
      `<p>Order #${order.orderNumber}</p>
       <p>Total: $${order.total.toFixed(2)}</p>
       <p>We'll notify you as your order progresses.</p>`,
    ),
  );
}

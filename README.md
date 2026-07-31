# Savoria — Restaurant Website & Management System

A production-grade MERN restaurant platform: public marketing site, online ordering, table
reservations, reviews, loyalty, and a full role-based admin back-office.

## Tech Stack

**Frontend** — React 19, Vite, Tailwind CSS v4, Redux Toolkit, React Router DOM v7, Framer
Motion, React Hook Form, Axios, React Hot Toast, React Icons, Swiper.js, Recharts,
`@react-oauth/google`.

**Backend** — Node.js, Express 5, MongoDB + Mongoose, JWT auth (access + refresh), bcrypt,
Nodemailer, Multer, Cloudinary, Helmet, CORS, express-validator, Morgan, express-rate-limit,
`google-auth-library`.

## Project Structure

```
resturantwebsite/
├── client/                  React 19 + Vite SPA
│   ├── src/
│   │   ├── assets/          Images, icons, videos
│   │   ├── components/      common/ layout/ ui/ menu/ home/ admin/
│   │   ├── layouts/         MainLayout, AuthLayout, AdminLayout
│   │   ├── pages/           public/ auth/ user/ (incl. dashboard/) admin/
│   │   ├── hooks/           useAuth, useWishlist, useDebounce, useCountUp, useSEO, ...
│   │   ├── redux/           store.js + slices/ (auth, cart, ui, wishlist)
│   │   ├── services/        axiosInstance.js + one module per API resource
│   │   ├── utils/           cn(), pricing calculations
│   │   ├── routes/          AppRoutes.jsx, ProtectedRoute.jsx
│   │   ├── context/         ThemeContext (dark mode)
│   │   ├── constants/       App-wide constants/enums
│   │   └── animations/      Shared Framer Motion variants
│   ├── vercel.json          SPA rewrite config for Vercel
│   ├── public/_redirects    SPA rewrite config for Netlify
│   └── .env.example
│
└── server/                  Express + MongoDB API
    ├── config/               db.js, cloudinary.js, nodemailer.js, multer.js
    ├── controllers/          Route handler logic, one file per resource
    ├── middleware/           auth.js, errorHandler.js, notFound.js, rateLimiter.js, validate.js
    ├── models/                Mongoose schemas
    ├── routes/                index.js mounts every feature router
    ├── services/              token/email/upload/order/rating/notification business logic
    ├── validators/            express-validator chains
    ├── uploads/               Local disk buffer before Cloudinary upload
    ├── utils/                 ApiError, ApiResponse, asyncHandler
    ├── app.js                 Express app: security, parsing, routes, error handling
    ├── server.js              Entry point: DB connect + HTTP server + graceful shutdown
    └── .env.example
```

## Installation

### Prerequisites
- Node.js 20+
- MongoDB (local instance or a free MongoDB Atlas cluster)

### Setup

```bash
# Backend
cd server
npm install
cp .env.example .env   # then fill in MONGODB_URI and secrets
npm run dev             # http://localhost:5000

# Frontend (separate terminal)
cd client
npm install
cp .env.example .env
npm run dev              # http://localhost:5173
```

The frontend dev server proxies `/api` requests to `http://localhost:5000` (see
`client/vite.config.js`), and `VITE_API_BASE_URL` in `client/.env` points Axios at the API
directly (used for the built production bundle, where there's no dev proxy).

### Environment Variables

See `server/.env.example` and `client/.env.example` for the full list.

Required to boot the API: `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`.
Optional but feature-gating:
- `SMTP_*` / `EMAIL_FROM` — without these, transactional emails (OTP, password reset, order/
  reservation status) are logged to the console instead of sent.
- `CLOUDINARY_*` — without these, image uploads (dishes, categories, avatars, reviews, blog
  covers) will fail; everything else works.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (server) and `VITE_GOOGLE_CLIENT_ID` (client) —
  without these, the Google sign-in button simply doesn't render.

### First Admin User

There's no seed script. Register a normal account through the UI, then promote it to `admin`
directly in MongoDB:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

## Build Phases

- [x] Phase 1 — Foundation (tooling, design tokens, dark mode, Redux, Axios w/ refresh
      interceptor, routing, layouts, Express security middleware, error handling)
- [x] Phase 2 — Public marketing pages (Home hero, featured dishes, categories, testimonials,
      gallery, offers, newsletter, About, Contact + map)
- [x] Phase 3 — Authentication (JWT + refresh, OTP email verification, Google login, forgot/
      reset password, RBAC middleware)
- [x] Phase 4 — Menu system (categories, dishes, search/filter/sort/pagination, dish details)
- [x] Phase 5 — Cart, coupons, checkout, order lifecycle & tracking
- [x] Phase 6 — Reservation system (booking flow + admin approval/reschedule)
- [x] Phase 7 — Reviews & wishlist
- [x] Phase 8 — User dashboard (profile, orders, reservations, wishlist, addresses,
      notifications, reward points, settings)
- [x] Phase 9 — Admin dashboard core + analytics (Recharts: revenue, order status, popular
      dishes)
- [x] Phase 10 — Admin menu/order/reservation management
- [x] Phase 11 — Customer & staff management (RBAC)
- [x] Phase 12 — Inventory & coupon management
- [x] Phase 13 — Blog (recipes, tips, news, events)
- [x] Phase 14 — AI-inspired features (recommendations, recently viewed, frequently ordered,
      smart search suggestions, dietary recommendations, trending)
- [x] Phase 15 — Accessibility, SEO, and performance pass
- [x] Phase 16 — Deployment configuration & final documentation

## API Reference

All routes are mounted under `/api/v1`. Protected routes require `Authorization: Bearer
<accessToken>`; staff-only routes additionally check role via `authorize(...roles)`.

| Resource | Base path | Notes |
|---|---|---|
| Health | `GET /health` | Uptime check |
| Auth | `/auth` | register, verify-otp, resend-otp, login, google, refresh-token, logout, forgot-password, reset-password, me |
| Categories | `/categories` | public list/get; admin create/update/delete |
| Dishes | `/dishes` | public list (search/filter/sort/paginate), trending, get by slug; staff create/update/delete, image removal |
| Orders | `/orders` | customer create/my-orders/get/cancel; staff list-all/update-status |
| Coupons | `/coupons` | customer validate; admin CRUD |
| Reservations | `/reservations` | customer create/my-reservations/cancel; staff list-all/update-status/reschedule |
| Reviews | `/reviews` | public list by dish; customer create/update/delete/like/report; admin list/reply/moderate |
| Users | `/users` | profile update, change password, addresses CRUD, wishlist get/toggle |
| Notifications | `/notifications` | list mine, mark read, mark all read |
| Analytics | `/analytics` | admin/manager only — summary, revenue, order-status, popular-dishes |
| Customers | `/customers` | admin/manager — list/search, detail, block/unblock, adjust reward points |
| Staff | `/staff` | admin only — list, create, update role, remove |
| Inventory | `/inventory` | staff — list (low-stock/expiring filters), CRUD, record purchase |
| Blog | `/blog` | public list/get; admin list-all/create/update/delete |
| Newsletter/Contact/Offers | `/newsletter/subscribe`, `/contact`, `/offers` | public; `/contact-messages` admin |
| Recommendations | `/recommendations` | search-suggestions & dietary are public; for-you & frequently-ordered require auth |

Every response follows `{ success, message, data }` (`ApiResponse`) or `{ success, message,
errors }` (`ApiError`) shapes — see `server/utils/`.

## Known Limitations / Next Steps

- **Payments** are represented as `cash_on_delivery` / `card` selections with no real payment
  gateway integration (Stripe, etc.) — orders are recorded and tracked, but card payments
  aren't actually charged. Wiring a provider means adding a `payments` service and webhook
  route.
- **Hero background video**: the homepage hero uses a styled gradient rather than a real video
  file, since no media asset pipeline was in scope. Swap in a `<video>` element in
  `client/src/components/home/Hero.jsx` once you have footage.
- **Google Maps** embeds use the no-API-key `maps.google.com/maps?q=...&output=embed` iframe
  form. For a branded pin, custom styling, or Places autocomplete, add
  `VITE_GOOGLE_MAPS_API_KEY` (already stubbed in `.env.example`) and swap in the JS Maps SDK.
- **No seed data / seed script** — the app has no demo content out of the box; use the admin
  panel to add categories, dishes, and coupons after creating an admin user (see above).
- **SPA SEO** is handled client-side via a lightweight `useSEO` hook (sets `document.title` and
  OG meta tags per page). There's no server-side rendering, so crawlers that don't execute JS
  will only see the shell in `index.html`. For true SSR/SSG, consider migrating to Next.js/
  Remix, or pre-rendering key routes.

## Deployment

**Backend** — any Node host works (Render, Railway, Fly.io, a VPS). Set the environment
variables from `server/.env.example`, use `npm start` as the run command, and point
`MONGODB_URI` at a MongoDB Atlas cluster. Set `CLIENT_URL` to your deployed frontend origin
(comma-separate multiple origins if needed) so CORS allows it.

**Frontend** — deploy `client/` to Vercel or Netlify as a static Vite build
(`npm run build` → `dist/`). Both `vercel.json` and `public/_redirects` are already included so
client-side routing doesn't 404 on refresh. Set `VITE_API_BASE_URL` to your deployed backend's
`/api/v1` URL, plus `VITE_GOOGLE_CLIENT_ID` if using Google login.

**Cookies** — the refresh token is set as an `httpOnly` cookie scoped to `/api/v1/auth`. In
production (`NODE_ENV=production`) it's marked `secure`, so both frontend and backend must be
served over HTTPS for login persistence to work correctly.

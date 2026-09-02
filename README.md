# LUXE Store

Full-stack e-commerce app based on the UX wireframe flow. Next.js App Router, REST APIs, and a JSON data store with in-memory fallback for serverless.

## Features

- Auth: register, login, logout, account settings
- Catalog: home, categories, filters, search, product details, reviews
- Cart, wishlist, addresses
- Checkout → **Pay Now** creates the order immediately (no card/UPI/gateway)
- Order receipt, order history
- Testimonials, stylist booking calendar, live chat, contact form

Purchase path: **Products → Details → Add to cart → Cart → Checkout → Pay Now → Receipt**

## Run locally

```bash
cd luxe-store
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push this folder to GitHub.
2. Import the repo in Vercel (Next.js is detected automatically).
3. Set `SESSION_SECRET` in project environment variables.

Serverless instances cannot reliably write `data/db.json`. Orders still work in-memory per instance. For durable production data, point `src/lib/db.ts` at Postgres, Neon, or Turso.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET/POST/DELETE | `/api/auth` | Session |
| GET | `/api/products` | List / detail (`?slug=`) |
| GET/POST/PATCH/DELETE | `/api/cart` | Cart CRUD |
| GET/POST | `/api/wishlist` | Wishlist toggle |
| GET/POST | `/api/orders` | Create order (Pay Now) / list |
| GET/POST/DELETE | `/api/addresses` | Saved addresses |
| PATCH | `/api/account` | Profile |
| GET/POST | `/api/bookings` | Calendar bookings |
| GET/POST | `/api/chat` | Live chat |
| POST | `/api/contact` | Contact form |
| GET | `/api/testimonials` | Reviews carousel |

# PERZN

A deal-driven fashion e-commerce site (inspired by Street Style Store's structure) —
curated flash-deal rails, scarcity-driven "loot meter" stock gauges, and UPI/card
checkout via Razorpay.

**Stack:** React + Vite (frontend) · FastAPI (backend) · Supabase Postgres + Auth ·
Razorpay · Vercel (deploy target for both)

## Project layout

```
perzn/
├── backend/          FastAPI app (Supabase service-role access + Razorpay)
│   ├── app/
│   │   ├── routers/  categories, products, collections, cart, coupons, orders
│   │   ├── core/     config, supabase client, auth dependency
│   │   └── main.py
│   ├── api/index.py  Vercel serverless entrypoint
│   └── requirements.txt
├── frontend/         React + Vite + Tailwind
│   └── src/
│       ├── components/  Navbar, Footer, ProductCard, DealRail, LootMeter, CountdownBadge
│       ├── pages/        Home, Category, ProductDetail, Cart, Checkout, Login, Orders
│       ├── hooks/        useCart, useCountdown
│       └── lib/          supabaseClient, api (axios), types
└── supabase/
    └── schema.sql    full DB schema + RLS policies
```

## 1. Set up Supabase

1. Create a project at supabase.com
2. Open the SQL editor, paste and run `supabase/schema.sql`
3. Go to Authentication → Providers → make sure Email (magic link) is enabled
4. Grab your project URL + anon key (Settings → API) for the frontend,
   and the **service_role** key for the backend (keep this one secret — never
   put it in frontend env vars)

## 2. Backend setup

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # fill in SUPABASE_URL, SUPABASE_SERVICE_KEY, RAZORPAY keys
uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/api/health` to confirm it's running.

Get Razorpay test keys from the Razorpay dashboard (Test Mode) — no live KYC
needed to start building.

## 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
npm run dev
```

Visit `http://localhost:5173`.

## 4. Seed some data

Nothing will render on the homepage until you have categories, products, and at
least one collection with products in it. Use the Supabase table editor, or
run `supabase/seed.sql` (included) for a handful of sample products to get the
UI rendering end-to-end.

## 5. Deploy

- **Frontend → Vercel**: import the `frontend/` folder as a project, set the
  three `VITE_*` env vars in Vercel's dashboard.
- **Backend → Vercel**: import `backend/` as a separate project (it has its
  own `vercel.json`). Set `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`,
  `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` as env vars.
  - Note: FastAPI on Vercel's Python runtime works fine for this scope, but if
    you hit cold-start or dependency-size issues later, Railway or Render are
    easier long-term homes for a FastAPI service — same code, no changes needed.
- Update `CORS_ORIGINS` in `backend/app/core/config.py` to your real frontend
  domain once deployed.

## What's stubbed / what to build next

- **Search** — no search endpoint yet; add a `/api/products?q=` filter using
  Postgres full-text search or `ilike` when you're ready.
- **Wishlist/favorites** — schema doesn't have this table yet; same shape as
  `cart_items` minus quantity.
- **Admin panel** — products/collections are managed directly via the Supabase
  table editor for now. Given your JRPFIN/Fleeto builds already have an
  admin-panel pattern, that's a natural thing to port over next.
- **Shipping fee logic** — currently hardcoded to 0 in checkout; wire up real
  rules (free above ₹X, flat fee below) in `orders.py` when ready.
- **Order status webhooks** — Razorpay webhook endpoint for handling
  refunds/failures async isn't built yet; current flow only confirms on the
  frontend's success callback + signature check.

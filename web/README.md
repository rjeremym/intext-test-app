# CRISP-DM Demo Shop (Chapter 17)

Next.js (React) app deployed to Vercel, backed by Supabase Postgres.

## 1) Prereqs
- Node.js installed
- Supabase account
- Supabase CLI available via `npx supabase`

## 2) Database (Supabase Postgres)
This repo includes migrations under `../supabase/migrations/`.

### Apply migrations to a Supabase project
1. Create a Supabase project.
2. Link the CLI to your project (run from repo root):

```bash
npx supabase link --project-ref <your-project-ref>
```

3. Push migrations:

```bash
npx supabase db push
```

### Seed data from `shop.db` (SQLite)
Recommended approach:
- Export your SQLite tables to CSV using `sqlite3`, then import into Supabase (Table Editor → Import data).

Tables (import in this order):
1. `customers`, `products`
2. `orders`
3. `order_items`, `shipments`, `product_reviews`

## 3) App environment variables
Copy `.env.example` to `.env.local` and fill in values:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)

## 4) Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Pages implemented so far
- `/select-customer`
- `/dashboard`
- `/place-order`
- `/orders` and `/orders/[order_id]`
- `/warehouse/priority`
- `/scoring` (POST `/api/scoring/run`)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

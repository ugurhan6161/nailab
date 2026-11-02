# NAILAB

NAILAB is a React, TypeScript, and Vite storefront. Supabase is the source of truth for authentication, product inventory and pricing, website copy, orders, customer profiles, and academy data.

## Supabase setup

1. In Supabase, run every SQL migration in `supabase/migrations` in filename order. This applies the existing schema and security policies, creates the website content table and customer-profile trigger, imports the product and website-copy seed data, adds editable categories, academy admin access, the updated preorder function, ensures products receive a UUID by default, and creates the public `product-images` Storage bucket. Only administrators can upload or remove bucket files; storefront visitors can read product images.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel Project Settings → Environment Variables for Preview and Production. Use the project's Supabase URL and public anon/publishable key; never put the `service_role` key in a `VITE_` variable.
3. Create a Telegram bot with BotFather, open a direct chat with it and send `/start`, or add it to the destination group/channel with permission to post. Set the exact bot token as `TELEGRAM_BOT_TOKEN` and the target chat's numeric ID (group IDs are usually negative) as `TELEGRAM_CHAT_ID` in Vercel for Preview and Production. Do not include `bot` in the token or add quotes/spaces; do not prefix either variable with `VITE_` or expose them in browser code. Redeploy after setting the variables. If Telegram rejects the message, Vercel logs now include Telegram's response description and the confirmation page explains the likely chat/permission issue. If Telegram is unavailable, the order is still saved.
4. Use Node.js 22.x in Vercel Project Settings → General → Node.js Version, then redeploy after setting the variables.
5. Create an account through `/giris` (or create one under Supabase Authentication → Users). In Supabase SQL Editor, grant administrator access to that account by running:

   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE id = (
     SELECT id
     FROM auth.users
     WHERE lower(email) = lower('admin@example.com')
     LIMIT 1
   );
   ```

   Replace the example email with the exact administrator account email. The account must already exist. Do not expose a service-role key to the browser. Admin access is determined by the `profiles.role` value and enforced by Supabase RLS.

6. Sign in at `/admin/giris`. `/admin/icerik` manages products, categories, academy courses, and website copy directly in Supabase. For product images, select a JPG, PNG, or WebP file up to 5 MB from the device; it uploads to the `product-images` bucket when you save products. You can also keep using an image URL. Product/course removal preserves historical records by taking them off sale or deactivating them; deleting a category also takes its active products off sale. Changes take effect without another deployment.

Customers can track an order without signing in at the bottom of `/giris` or at `/siparis-takip`. The order confirmation includes a copy-code action and a branded print-ready order form; choose “Save as PDF” in the browser's print dialog to download it.

An `auth/v1/token?grant_type=refresh_token` 400 means the browser's saved Supabase session could not be refreshed (commonly an expired or revoked refresh token). Sign out and sign in again to replace that session. Guest checkout does not require the session and can still submit the order.

The customer sign-up trigger creates a `customer` profile automatically. Customers can update their name, phone number, and saved address in `/hesabim`; a successful sign-in opens this account page. To grant trainer access, change that user's profile role to `trainer` using the Supabase SQL Editor. Trainers sign in at `/egitmen-giris` and see published courses from Supabase; only administrators can manage course records in `/admin/icerik`.

## Local development

Copy `.env.example` to `.env.local`, fill in the two public Supabase values, then run:

```sh
npm install
npm run dev
```

`.env.local` is local-only and must not be committed. The Vercel rewrite in `vercel.json` sends client-side routes to the React app; application data and authentication use Supabase directly.

## Validation

```sh
npm run build
npm run lint
```

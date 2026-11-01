# NAILAB

NAILAB is a React, TypeScript, and Vite storefront. Supabase is the source of truth for authentication, product inventory and pricing, website copy, orders, customer profiles, and academy data.

## Supabase setup

1. In Supabase, run every SQL migration in `supabase/migrations` in filename order. This applies the existing schema and security policies, creates the website content table and customer-profile trigger, imports the product and website-copy seed data, and adds editable categories, academy admin access, and the updated preorder function. Apply `20261102100003_preorder_notifications.sql` before deploying the matching application changes.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel Project Settings → Environment Variables for Preview and Production. Use the project's Supabase URL and public anon/publishable key; never put the `service_role` key in a `VITE_` variable.
3. Create a Telegram bot with BotFather, add it to the destination chat/group, and obtain the chat ID. Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` as server-only Vercel environment variables for Preview and Production. Do not prefix either with `VITE_` or expose them in browser code. Redeploy after setting the variables. If Telegram is unavailable, the order is still saved and the confirmation page reports that the notification could not be sent.
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

6. Sign in at `/admin/giris`. `/admin/icerik` manages products, categories, academy courses, and website copy directly in Supabase. Product/course removal preserves historical records by taking them off sale or deactivating them; deleting a category also takes its active products off sale. Changes take effect without another deployment.

Customers can track an order without signing in at the bottom of `/giris` or at `/siparis-takip`. The order confirmation includes a copy-code action and a branded print-ready order form; choose “Save as PDF” in the browser's print dialog to download it.

The customer sign-up trigger creates a `customer` profile automatically. To grant trainer access, change that user's profile role to `trainer` using the Supabase SQL Editor.

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

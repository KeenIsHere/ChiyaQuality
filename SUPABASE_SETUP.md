# Supabase setup

## Client values required

Create `project/.env.local` with these two values from Supabase Dashboard > Project Settings > API:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-anon-key
```

The anon/publishable key is safe for browser use when Row Level Security is enabled. Never put the service-role key, database password, JWT secret, or SMTP credentials in this file or in the frontend.

## Apply the database foundation

1. Open Supabase Dashboard > SQL Editor.
2. Run `supabase/migrations/001_chiyaquality_foundation.sql`.
3. In Authentication > Users, create the first staff user with email/password.
4. Insert its profile from the SQL Editor, replacing the UUID and name:

```sql
insert into public.profiles (id, full_name, role)
values ('AUTH_USER_UUID', 'Restaurant Admin', 'admin');
```

5. Seed categories, menu items, and tables from the Admin screens once those screens are connected.

## Security boundary

Staff user creation must use the Supabase Dashboard, an Edge Function, or a trusted server. The service-role key must never be shipped to Vite or exposed in browser code. Customer QR orders use the `submit_customer_order` RPC and never receive direct write access to orders.
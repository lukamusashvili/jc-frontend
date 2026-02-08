# Supabase Setup Instructions

## Quick Setup Steps

### 1. Run SQL Schema

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the entire contents of `supabase-schema.sql`
6. Click **Run** (or press Ctrl+Enter)

This will create:
- All tables (product, category, supplier, wallet, transactions)
- Sequences for auto-incrementing IDs
- Indexes for performance
- Row Level Security policies
- Triggers for updated_at timestamps

### 2. Verify Tables Created

After running the SQL:
1. Go to **Table Editor** in Supabase dashboard
2. You should see 5 tables: `product`, `category`, `supplier`, `wallet`, `transactions`

### 3. Test Authentication

Your user credentials (from supabase.txt):
- **Email**: shorena.uvc@gmail.com
- **Password**: 1qaz!QAZ2wsx.

The login form will use the email as the "user" field.

### 4. Test the App

1. Start the frontend: `npm run dev`
2. Navigate to `/login`
3. Login with:
   - User: `shorena.uvc@gmail.com`
   - Password: `1qaz!QAZ2wsx.`
4. You should be able to access all features

## Troubleshooting

### If you get "relation does not exist" error
- Make sure you ran the SQL schema script completely
- Check that all tables were created in Table Editor

### If authentication fails
- Verify the user exists in Supabase Authentication > Users
- Check that the email matches exactly: `shorena.uvc@gmail.com`
- Make sure RLS policies were created (check in Authentication > Policies)

### If you get permission errors
- Verify RLS policies were created for all tables
- Check that policies allow `authenticated` role to do everything

## About Prisma

**You don't need Prisma for this setup!**

- **Prisma** is an ORM typically used in backend/Node.js applications
- **Supabase Client** (what we're using) is perfect for frontend React apps
- Supabase provides:
  - Auto-generated REST API
  - Real-time subscriptions
  - Built-in authentication
  - TypeScript types (can be generated)
  - No need for an ORM layer

The Supabase client is simpler and more direct for frontend use cases like yours.

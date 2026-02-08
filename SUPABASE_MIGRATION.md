# Supabase Migration Guide

## Steps to Complete Migration

### 1. Set Up Environment Variables

Create a `.env` file in `jc-frontend/` directory with:

```
VITE_SUPABASE_URL=https://htuqoigonqpvbxqhlstn.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_aeoH2w2B1amu1TgNV-sbaQ_m6rmPb-r
```

### 2. Run SQL Schema in Supabase

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL script to create all tables, sequences, and RLS policies

### 3. Create Admin User

You need to create an admin user in Supabase:

1. Go to Authentication > Users in Supabase dashboard
2. Click "Add user" > "Create new user"
3. Enter an email (this will be your "user" field in login)
4. Enter a password
5. Save the user

**Note:** The login form uses the "user" field as the email address for Supabase Auth.

### 4. Migrate Existing Data (Optional)

If you have existing data in MongoDB, you'll need to:

1. Export data from MongoDB
2. Transform the data format (MongoDB to PostgreSQL)
3. Import into Supabase using the SQL Editor or Supabase Dashboard

You can use a script like this to help migrate:

```sql
-- Example: Insert products
INSERT INTO product (title, category, supplier, total_quantity, quantity, unit_cost, unit_price, ...)
VALUES (...);
```

### 5. Test the Application

1. Start the frontend: `npm run dev`
2. Try logging in with the admin user you created
3. Test CRUD operations for all entities (products, categories, suppliers, wallets)

### 6. Update Login Form (if needed)

The login form currently uses "user" and "password" fields. The "user" field is treated as email for Supabase Auth. If you want to change this, update `src/pages/Login.tsx`.

## What Changed

### Backend
- ✅ All API calls now use Supabase client instead of custom backend
- ✅ Authentication uses Supabase Auth instead of custom token system
- ✅ Database operations use Supabase REST API

### Frontend
- ✅ All action files (`auth.ts`, `products.ts`, `categories.ts`, `suppliers.ts`, `wallets.ts`) refactored to use Supabase
- ✅ Supabase client utility created at `src/utils/supabase.ts`
- ✅ Authentication flow updated to use Supabase Auth

### Database
- ✅ MongoDB replaced with PostgreSQL (Supabase)
- ✅ Custom ID sequences replaced with PostgreSQL sequences
- ✅ Row Level Security (RLS) enabled for all tables
- ✅ Policies allow all operations for authenticated users

## Troubleshooting

### Authentication Issues
- Make sure you've created a user in Supabase Authentication
- Check that environment variables are set correctly
- Verify RLS policies are created correctly

### Data Migration Issues
- Ensure data types match between MongoDB and PostgreSQL
- Check that sequences are initialized correctly
- Verify foreign key constraints if any

### API Errors
- Check Supabase dashboard for error logs
- Verify RLS policies allow operations
- Ensure user is authenticated (check session)

## Rollback Plan

The original backend is still in `jc-backend/` directory. To rollback:

1. Revert changes to action files (use git if available)
2. Start the backend server: `cd jc-backend && npm run dev`
3. Update frontend to point back to `http://localhost:3000`

## Next Steps

1. ✅ Complete data migration from MongoDB
2. ✅ Test all functionality
3. ✅ Remove old backend code (after confirming everything works)
4. ✅ Update documentation

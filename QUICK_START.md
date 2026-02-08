# 🚀 Quick Start - Supabase Setup

## Step 1: Run SQL Schema (2 minutes)

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Click "SQL Editor"** (left sidebar)
4. **Click "New Query"**
5. **Open** `supabase-schema.sql` file and **copy all contents**
6. **Paste** into SQL Editor
7. **Click "Run"** (or Ctrl+Enter)

✅ You should see: "Success. No rows returned"

## Step 2: Verify Setup

1. In Supabase Dashboard, click **"Table Editor"**
2. You should see 5 tables:
   - ✅ product
   - ✅ category  
   - ✅ supplier
   - ✅ wallet
   - ✅ transactions

## Step 3: Test Login

1. **Start frontend**: `npm run dev`
2. **Go to**: http://localhost:5173/login
3. **Login with**:
   - User: `shorena.uvc@gmail.com`
   - Password: `1qaz!QAZ2wsx.`

## That's it! 🎉

Your app is now using Supabase instead of the backend.

---

## About Prisma

**You don't need Prisma!** 

- ✅ **Supabase Client** (what we use) is perfect for React frontend
- ❌ **Prisma** is for backend Node.js apps (not needed here)
- ✅ Supabase gives you REST API, Auth, Real-time - all built-in
- ✅ No ORM layer needed - direct database access

The Supabase client is simpler and more powerful for frontend apps.

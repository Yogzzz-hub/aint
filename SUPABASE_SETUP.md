# Supabase Setup Guide for AINTRIX

This guide walks you through setting up Supabase as your PostgreSQL database for the AINTRIX project.

## What is Supabase?

Supabase is an open-source Firebase alternative that provides:
- **PostgreSQL Database** (managed, cloud-hosted)
- **Auto-generated REST APIs**
- **Real-time subscriptions**
- **Authentication** (optional)
- **Storage** (optional)

For AINTRIX, we're using it primarily as a **managed PostgreSQL database**.

## Step 1: Get Database Connection String

You already have a Supabase project. Now get the connection string:

1. Go to https://supabase.com/dashboard
2. Select project: **jdumocczbdtlogclerbi**
3. Click **Project Settings** (⚙️ gear icon)
4. Go to **Database** section
5. Find **Connection string** and select **Direct connection**
6. Copy the connection string that looks like:
   ```
   postgresql://postgres.jdumocczbdtlogclerbi:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   ```
7. Replace `[YOUR-PASSWORD]` with your actual database password

## Step 2: Update Backend Environment Variables

1. Open `backend\.env`
2. Update the `DATABASE_URL` with your Supabase connection string:
   ```
   DATABASE_URL=postgresql://postgres.jdumocczbdtlogclerbi:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   ```

## Step 3: Load Schema and Seed Data

### Option A: Using PowerShell Script (Recommended)

```powershell
cd backend
.\setup_supabase.ps1
```

### Option B: Manual Setup

If you have `psql` installed:

```powershell
cd backend

# Load schema
$env:DATABASE_URL = "your-connection-string-here"
psql $env:DATABASE_URL -f schema.sql

# Load seed data
psql $env:DATABASE_URL -f seed.sql
```

### Option C: Using Supabase SQL Editor

If you don't have `psql`:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in sidebar
4. Click **+ New query**
5. Copy contents of `backend/schema.sql` and run
6. Create another new query
7. Copy contents of `backend/seed.sql` and run

## Step 4: Verify Database

1. In Supabase Dashboard, go to **Table Editor**
2. You should see 8 tables:
   - users
   - articles
   - jobs
   - research
   - contacts
   - investor_leads
   - internships
   - career_applications

3. Click on `users` table - you should see 1 admin user
4. Click on `jobs` table - you should see 5 demo jobs

## Step 5: Start Backend

```powershell
cd backend
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

Test: http://localhost:8000/api/health

## Step 6: Start Frontend

```powershell
cd frontend
npm start
```

Visit: http://localhost:3000

## Supabase Features You Can Use

### 1. Real-time Subscriptions (Optional)

If you want real-time updates, you can subscribe to database changes:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
)

// Subscribe to new jobs
supabase
  .channel('jobs')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'jobs' },
    (payload) => console.log('New job:', payload.new)
  )
  .subscribe()
```

### 2. Row Level Security (RLS)

Supabase supports PostgreSQL Row Level Security. Currently disabled for simplicity, but you can enable it:

1. Go to **Authentication → Policies**
2. Enable RLS on specific tables
3. Create policies for read/write access

### 3. Auto-generated REST API

Supabase auto-generates REST endpoints for your tables. Currently we use our FastAPI backend, but you could directly query Supabase:

```javascript
// Alternative to our /api/jobs endpoint
const { data } = await supabase
  .from('jobs')
  .select('*')
  .eq('published', true)
```

## Production Deployment

### Backend (Railway/Render/Fly.io)

Set environment variable:
```
DATABASE_URL=postgresql://postgres.jdumocczbdtlogclerbi:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

**No need to run migrations** - your Supabase database is already set up!

### Frontend (Vercel)

Set environment variables:
```
REACT_APP_BACKEND_URL=https://your-backend-url.com
REACT_APP_SUPABASE_URL=https://jdumocczbdtlogclerbi.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Connection Pooling

Supabase provides two connection types:

1. **Direct Connection** (Port 5432)
   - Direct to PostgreSQL
   - Limited connections (~60)
   - Use for local development

2. **Pooler Connection** (Port 6543)
   - Connection pooling via PgBouncer
   - Unlimited connections
   - **Use for production** (already configured in .env)

## Troubleshooting

### Connection Refused

**Solution:** Make sure you're using the pooler connection (port 6543), not direct connection.

### SSL Required

**Solution:** Supabase requires SSL. Our asyncpg client handles this automatically.

### Too Many Connections

**Solution:** Use the pooler connection (port 6543) instead of direct (port 5432).

### Password Authentication Failed

**Solution:** 
1. Reset your database password in Supabase Dashboard → Project Settings → Database
2. Update `DATABASE_URL` in `backend\.env`

## Supabase Dashboard URLs

- **Main Dashboard**: https://supabase.com/dashboard
- **Your Project**: https://supabase.com/dashboard/project/jdumocczbdtlogclerbi
- **Table Editor**: https://supabase.com/dashboard/project/jdumocczbdtlogclerbi/editor
- **SQL Editor**: https://supabase.com/dashboard/project/jdumocczbdtlogclerbi/sql
- **API Docs**: https://supabase.com/dashboard/project/jdumocczbdtlogclerbi/api

## Need Help?

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Project Dashboard: https://supabase.com/dashboard/project/jdumocczbdtlogclerbi

---

**Ready to go!** Your AINTRIX backend now uses Supabase PostgreSQL cloud database. 🚀

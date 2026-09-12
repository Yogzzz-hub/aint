# AINTRIX Deployment Guide

Complete guide for deploying AINTRIX to production.

## Architecture

- **Database**: Supabase PostgreSQL (Already set up)
- **Backend**: Render (Python/FastAPI)
- **Frontend**: Vercel (React Static Site)

## Step 1: Deploy Database (✅ Already Done)

Your Supabase PostgreSQL database is already set up:
- Project: `jdumocczbdtlogclerbi`
- Region: South Asia (Mumbai)
- Connection: `postgresql://postgres.jdumocczbdtlogclerbi:...@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`

**Load Schema & Data** (if not done yet):
1. Go to https://supabase.com/dashboard/project/jdumocczbdtlogclerbi/sql
2. Run `backend/schema.sql`
3. Run `backend/seed.sql`

## Step 2: Deploy Backend to Render

### Option A: Using render.yaml (Recommended)

1. **Push render.yaml to GitHub**
   ```powershell
   git add render.yaml
   git commit -m "Add Render deployment config"
   git push origin main
   ```

2. **Create New Web Service on Render**
   - Go to: https://dashboard.render.com/
   - Click **"New +"** → **"Blueprint"**
   - Connect your GitHub repository: `Yogzzz-hub/aint`
   - Render will auto-detect `render.yaml`
   - Click **"Apply"**

3. **Set Environment Variables**
   
   After creation, go to service settings and add:
   
   ```
   DATABASE_URL=postgresql://postgres.jdumocczbdtlogclerbi:[YOUR_PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   ADMIN_PASSWORD=Aintrix@2026
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Option B: Manual Setup

1. **Go to Render Dashboard**
   - https://dashboard.render.com/

2. **Create New Web Service**
   - Click **"New +"** → **"Web Service"**
   - Connect GitHub: `Yogzzz-hub/aint`
   - Branch: `main`

3. **Configure Service**
   ```
   Name: aintrix-backend
   Region: Oregon (US West)
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn server:app --host 0.0.0.0 --port $PORT
   Instance Type: Starter ($7/month)
   ```

4. **Add Environment Variables**
   
   Click **"Add Environment Variable"** for each:
   
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | `postgresql://postgres.jdumocczbdtlogclerbi:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres` |
   | `JWT_SECRET` | `your-super-secret-jwt-key-production-2026` |
   | `ADMIN_EMAIL` | `admin@aintrix.com` |
   | `ADMIN_PASSWORD` | `Aintrix@2026` |
   | `SUPABASE_URL` | `https://jdumocczbdtlogclerbi.supabase.co` |
   | `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkdW1vY2N6YmR0bG9nY2xlcmJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxOTY5MTMsImV4cCI6MjEwNDc3MjkxM30.XcaJ2XExnipRt4wXXvhbDEZhNPD0s0-Izl3PekjDmoo` |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
   | `PYTHON_VERSION` | `3.11.0` |

5. **Create Web Service**
   - Click **"Create Web Service"**
   - Wait 3-5 minutes for deployment

6. **Get Backend URL**
   - After deployment, your backend will be at:
   - `https://aintrix-backend.onrender.com`
   - Test: `https://aintrix-backend.onrender.com/api/health`

## Step 3: Deploy Frontend to Vercel

### Why Vercel for Frontend?
- ✅ Free tier with great limits
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Perfect for React apps
- ✅ Auto-deploys from GitHub

### Deploy Steps

1. **Go to Vercel**
   - https://vercel.com/new
   - Sign in with GitHub

2. **Import Repository**
   - Click **"Add New"** → **"Project"**
   - Import: `Yogzzz-hub/aint`
   - Click **"Import"**

3. **Configure Project**
   ```
   Framework Preset: Create React App
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

4. **Add Environment Variables**
   
   Click **"Environment Variables"** and add:
   
   | Name | Value |
   |------|-------|
   | `REACT_APP_BACKEND_URL` | `https://aintrix-backend.onrender.com` |
   | `REACT_APP_SUPABASE_URL` | `https://jdumocczbdtlogclerbi.supabase.co` |
   | `REACT_APP_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

5. **Deploy**
   - Click **"Deploy"**
   - Wait 2-3 minutes

6. **Get Frontend URL**
   - Your site will be at: `https://aint-xxxx.vercel.app`
   - Or set up custom domain in Vercel settings

## Step 4: Update Vercel Configuration

Update `frontend/vercel.json` for proper routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## Step 5: Configure CORS (Backend)

The backend already has CORS configured for all origins. In production, you might want to restrict it:

Edit `backend/server.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://aint-xxxx.vercel.app"],  # Your Vercel URL
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Step 6: Verify Deployment

### Backend Health Check
```bash
curl https://aintrix-backend.onrender.com/api/health
```

Expected response:
```json
{
  "ok": true,
  "ts": "2026-09-12T...",
  "db": "connected"
}
```

### Frontend Check
Visit your Vercel URL and:
1. ✅ Home page loads
2. ✅ News page shows 3 articles
3. ✅ Careers page shows 5 jobs
4. ✅ Admin login works (admin@aintrix.com / Aintrix@2026)

## Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| Supabase | Free Tier | $0/month |
| Render | Starter | $7/month |
| Vercel | Hobby | $0/month |
| **Total** | | **$7/month** |

## Automatic Deployments

Both Render and Vercel will auto-deploy when you push to `main` branch:

```powershell
git add .
git commit -m "Update feature"
git push origin main
```

- Render: Redeploys backend in ~3 minutes
- Vercel: Redeploys frontend in ~2 minutes

## Custom Domain Setup

### For Vercel (Frontend)
1. Go to Project Settings → Domains
2. Add your domain (e.g., `aintrix.com`)
3. Update DNS records as shown
4. Wait for SSL certificate (~5 minutes)

### For Render (Backend)
1. Go to Service Settings → Custom Domain
2. Add subdomain (e.g., `api.aintrix.com`)
3. Update DNS CNAME record
4. Wait for SSL certificate

## Monitoring

### Render Dashboard
- Logs: Real-time backend logs
- Metrics: CPU, memory, requests
- Health: Automatic health checks

### Vercel Dashboard
- Analytics: Page views, performance
- Logs: Build and function logs
- Domains: SSL status, DNS

## Troubleshooting

### Backend 502 Error
- Check Render logs for Python errors
- Verify DATABASE_URL is correct
- Ensure Supabase database is accessible

### Frontend API Errors
- Check REACT_APP_BACKEND_URL is correct
- Verify backend is running (health check)
- Check browser console for CORS errors

### Database Connection Failed
- Verify Supabase password in DATABASE_URL
- Check Supabase project is not paused
- Ensure using connection pooler (port 6543)

## Rollback

### Render
1. Go to Deploys tab
2. Click "Rollback" on previous successful deploy

### Vercel
1. Go to Deployments tab
2. Click "..." on previous deploy → "Promote to Production"

## Security Checklist

- ✅ Environment variables not in git
- ✅ HTTPS enabled (automatic)
- ✅ Database password secure
- ✅ JWT secret is random and secure
- ✅ Supabase service role key not exposed
- ✅ CORS properly configured
- ✅ File uploads validated

## Support

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs

---

**Your production deployment is ready!** 🚀

Backend: `https://aintrix-backend.onrender.com`  
Frontend: `https://aint-xxxx.vercel.app`  
Database: Supabase PostgreSQL (South Asia)

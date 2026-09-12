# AINTRIX Local Development Setup

This guide will help you set up the AINTRIX project locally on Windows.

## Prerequisites

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **Python** (v3.10 or higher) - [Download](https://www.python.org/downloads/)
3. **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/windows/)

## Step 1: Clone the Repository

```powershell
git clone https://github.com/Yogzzz-hub/aint.git
cd aint
```

## Step 2: Set Up PostgreSQL Database

### Install PostgreSQL

1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the prompts
3. Remember the password you set for the `postgres` user
4. Keep default port `5432`

### Create Database and Load Schema

Open **pgAdmin 4** or use **psql** command line:

```powershell
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE aintrix;

# Connect to the database
\c aintrix

# Exit psql
\q
```

Now load the schema and seed data:

```powershell
cd backend

# Load schema
psql -U postgres -d aintrix -f schema.sql

# Load seed data
psql -U postgres -d aintrix -f seed.sql
```

## Step 3: Backend Setup

### Update Environment Variables

1. Copy the example env file:
   ```powershell
   cd backend
   copy .env.example .env
   ```

2. Edit `backend\.env` and update the `DATABASE_URL` with your PostgreSQL password:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/aintrix
   ```

### Install Python Dependencies

```powershell
cd backend
pip install -r requirements.txt
```

### Run the Backend Server

```powershell
cd backend
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at **http://localhost:8000**

**Test it:** Open http://localhost:8000/api/health in your browser

## Step 4: Frontend Setup

### Update Environment Variables

1. Copy the example env file:
   ```powershell
   cd frontend
   copy .env.example .env
   ```

2. The default `.env` should work for local development:
   ```
   REACT_APP_BACKEND_URL=http://localhost:8000
   ```

### Install Node Dependencies

```powershell
cd frontend
npm install
```

### Run the Frontend Development Server

```powershell
cd frontend
npm start
```

The frontend will be available at **http://localhost:3000**

## Step 5: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Health Check**: http://localhost:8000/api/health
- **Admin Login**: http://localhost:3000/admin/login

### Default Admin Credentials
- **Email**: `admin@aintrix.com`
- **Password**: `Aintrix@2026`

## Project Structure

```
aint/
├── backend/
│   ├── server.py          # FastAPI application
│   ├── schema.sql         # PostgreSQL schema
│   ├── seed.sql           # Seed data
│   ├── requirements.txt   # Python dependencies
│   ├── .env              # Environment variables (local)
│   └── uploads/          # Resume uploads
├── frontend/
│   ├── src/              # React source code
│   ├── build/            # Production build
│   ├── package.json      # Node dependencies
│   └── .env              # Environment variables (local)
└── SETUP.md             # This file
```

## Troubleshooting

### PostgreSQL Connection Error

**Error**: `could not connect to server`

**Solution**: 
- Make sure PostgreSQL service is running
- Check Windows Services for "PostgreSQL" and start it
- Verify the DATABASE_URL in `backend\.env` has the correct password

### Port Already in Use

**Error**: `Address already in use`

**Solution**:
```powershell
# Kill process on port 8000 (backend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process

# Kill process on port 3000 (frontend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### Module Not Found Errors

**Solution**: Reinstall dependencies
```powershell
# Backend
cd backend
pip install -r requirements.txt --force-reinstall

# Frontend
cd frontend
rm -r node_modules
npm install
```

## Production Deployment

### Backend (Render / Railway / Fly.io)

1. Set environment variable:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   ```
2. Deploy the `backend` folder
3. Run migrations: `psql $DATABASE_URL -f schema.sql && psql $DATABASE_URL -f seed.sql`

### Frontend (Vercel / Netlify)

1. Set environment variable:
   ```
   REACT_APP_BACKEND_URL=https://your-backend-url.com
   ```
2. Build command: `cd frontend && npm run build`
3. Output directory: `frontend/build`

## Need Help?

- Check the backend logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure PostgreSQL is running and accessible

---

**Built with:** React, FastAPI, PostgreSQL, TailwindCSS, Framer Motion, Three.js

# AINTRIX Global

A multi-sector innovation company building intelligent technologies, creative infrastructure, and sustainable businesses across eight industries.

## 🚀 Tech Stack

- **Frontend**: React 18, TailwindCSS, Framer Motion, Three.js, GSAP
- **Backend**: FastAPI (Python), PostgreSQL (Supabase), JWT Auth
- **Deployment**: Vercel (Frontend), Railway/Render (Backend), Supabase (Database)

## 📖 Quick Start

See [SETUP.md](./SETUP.md) for detailed local development instructions.

### Prerequisites
- Node.js 18+
- Python 3.10+
- Supabase account (or local PostgreSQL 14+)

### Database Setup

**Option A: Supabase (Recommended)**
See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for complete guide.

**Option B: Local PostgreSQL**
```bash
psql -U postgres -d aintrix -f backend/schema.sql
psql -U postgres -d aintrix -f backend/seed.sql
```

### Backend
```bash
cd backend
pip install -r requirements.txt
# Database is already set up on Supabase
python -m uvicorn server:app --reload --port 8000
```
```bash
cd frontend
npm install
npm start
```

## 🔐 Default Admin Credentials
- Email: `admin@aintrix.com`
- Password: `Aintrix@2026`

## 📁 Project Structure

```
aint/
├── backend/           # FastAPI + PostgreSQL
│   ├── server.py     # Main application
│   ├── schema.sql    # Database schema
│   ├── seed.sql      # Demo data
│   └── .env          # Environment config
├── frontend/         # React application
│   ├── src/          # Source code
│   ├── build/        # Production build
│   └── .env          # Environment config
└── SETUP.md         # Detailed setup guide
```

## 🌐 Deployment

See [SETUP.md](./SETUP.md#production-deployment) for production deployment instructions.

## 📝 License

Copyright © 2025 AINTRIX Global Private Limited. All rights reserved.
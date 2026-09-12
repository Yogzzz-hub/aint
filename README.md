# AINTRIX Global

A multi-sector innovation company building intelligent technologies, creative infrastructure, and sustainable businesses across eight industries.

## 🚀 Tech Stack

- **Frontend**: React 18, TailwindCSS, Framer Motion, Three.js, GSAP
- **Backend**: FastAPI (Python), PostgreSQL, JWT Auth
- **Deployment**: Vercel (Frontend), Railway/Render (Backend + DB)

## 📖 Quick Start

See [SETUP.md](./SETUP.md) for detailed local development instructions.

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL 14+

### Backend
```bash
cd backend
pip install -r requirements.txt
psql -U postgres -d aintrix -f schema.sql
psql -U postgres -d aintrix -f seed.sql
python -m uvicorn server:app --reload --port 8000
```

### Frontend
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
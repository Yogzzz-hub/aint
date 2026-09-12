"""AINTRIX Global — FastAPI backend with PostgreSQL
Handles: JWT auth, contacts, careers, internships, investor leads,
news CMS, research posts, and admin dashboard APIs.
"""
from dotenv import load_dotenv
load_dotenv()

import os
import io
import uuid
import bcrypt
import jwt as pyjwt
from datetime import datetime, timezone, timedelta
from typing import Optional, List
import json

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr, Field
import asyncpg

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white, black
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.pdfgen import canvas as pdfcanvas

# -----------------------------------------------------------------------------
# Config
# -----------------------------------------------------------------------------
DATABASE_URL = os.environ["DATABASE_URL"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALG = "HS256"
ACCESS_TTL_MIN = 60 * 24  # 24h

# Database connection pool
db_pool: Optional[asyncpg.Pool] = None

app = FastAPI(title="AINTRIX Global API", version="2.0.0")
api = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# Database helpers
# -----------------------------------------------------------------------------
async def get_db():
    """Get database connection from pool"""
    if db_pool is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    async with db_pool.acquire() as conn:
        yield conn

def serialize_record(record: asyncpg.Record) -> dict:
    """Convert asyncpg Record to dict with proper serialization"""
    if not record:
        return {}
    result = dict(record)
    for key, value in result.items():
        if isinstance(value, datetime):
            result[key] = value.isoformat()
    return result

def serialize_records(records: List[asyncpg.Record]) -> List[dict]:
    """Convert list of Records to list of dicts"""
    return [serialize_record(r) for r in records]

# -----------------------------------------------------------------------------
# Auth helpers
# -----------------------------------------------------------------------------
def now_utc() -> datetime:
    return datetime.now(timezone.utc)

def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False

def create_access_token(user_id: int, email: str) -> str:
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": now_utc() + timedelta(minutes=ACCESS_TTL_MIN),
        "type": "access",
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

async def get_current_admin(request: Request, conn = Depends(get_db)) -> dict:
    auth = request.headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else None
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await conn.fetchrow("SELECT * FROM users WHERE id = $1", int(payload["sub"]))
    if not user or user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user_dict = serialize_record(user)
    user_dict.pop("password_hash", None)
    return user_dict

# -----------------------------------------------------------------------------
# Models
# -----------------------------------------------------------------------------
class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ContactIn(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = ""
    subject: Optional[str] = ""
    message: str

class InvestorLeadIn(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = ""
    role: Optional[str] = ""

class InternshipIn(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = ""
    university: str
    program: str
    year: str
    interest: str
    portfolio: Optional[str] = ""
    cover: str
    resume_url: Optional[str] = ""

class CareerApplicationIn(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = ""
    position: str
    location: Optional[str] = ""
    experience_years: Optional[str] = ""
    linkedin: Optional[str] = ""
    cover: str
    resume_url: Optional[str] = ""

class ArticleIn(BaseModel):
    title: str
    slug: str
    category: str
    excerpt: str
    body: str
    cover_image: Optional[str] = ""
    author: Optional[str] = "AINTRIX Editorial"
    published: bool = False

class ResearchPostIn(BaseModel):
    title: str
    domain: str
    summary: str
    body: str
    cover_image: Optional[str] = ""
    published: bool = True

class JobIn(BaseModel):
    title: str
    department: str
    location: str
    type: str
    description: str
    requirements: List[str] = []
    published: bool = True

# -----------------------------------------------------------------------------
# Startup & Shutdown
# -----------------------------------------------------------------------------
@app.on_event("startup")
async def on_startup():
    global db_pool
    db_pool = await asyncpg.create_pool(
        DATABASE_URL,
        min_size=2,
        max_size=10,
        command_timeout=60
    )
    print("✓ Database pool created")

@app.on_event("shutdown")
async def on_shutdown():
    global db_pool
    if db_pool:
        await db_pool.close()
        print("✓ Database pool closed")

# -----------------------------------------------------------------------------
# Health
# -----------------------------------------------------------------------------
@api.get("/")
async def root():
    return {"status": "ok", "service": "AINTRIX Global API", "version": "2.0.0"}

@api.get("/health")
async def health(conn = Depends(get_db)):
    # Test DB connection
    await conn.fetchval("SELECT 1")
    return {"ok": True, "ts": now_utc().isoformat(), "db": "connected"}

# -----------------------------------------------------------------------------
# Auth
# -----------------------------------------------------------------------------
@api.post("/auth/login")
async def login(payload: LoginIn, conn = Depends(get_db)):
    email = payload.email.lower().strip()
    user = await conn.fetchrow("SELECT * FROM users WHERE email = $1", email)
    
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    
    token = create_access_token(user["id"], user["email"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"]
        },
    }

@api.get("/auth/me")
async def me(admin=Depends(get_current_admin)):
    return admin

# -----------------------------------------------------------------------------
# Public — Contacts
# -----------------------------------------------------------------------------
@api.post("/contacts")
async def submit_contact(payload: ContactIn, conn = Depends(get_db)):
    result = await conn.fetchrow(
        """
        INSERT INTO contacts (name, email, company, subject, message, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
        """,
        payload.name,
        payload.email.lower().strip(),
        payload.company,
        payload.subject,
        payload.message,
        "new",
        now_utc()
    )
    return {"ok": True, "id": result["id"]}

# -----------------------------------------------------------------------------
# Public — Investor Leads + Deck download
# -----------------------------------------------------------------------------
@api.post("/investor-leads")
async def submit_investor_lead(payload: InvestorLeadIn, conn = Depends(get_db)):
    await conn.execute(
        """
        INSERT INTO investor_leads (name, email, company, role, created_at)
        VALUES ($1, $2, $3, $4, $5)
        """,
        payload.name,
        payload.email.lower().strip(),
        payload.company,
        payload.role,
        now_utc()
    )
    return {"ok": True, "download_url": "/api/investor-deck/download"}

def _build_deck_pdf() -> io.BytesIO:
    """Programmatically generate an editorial monochrome investor deck PDF."""
    buf = io.BytesIO()

    class DeckCanvas(pdfcanvas.Canvas):
        def showPage(self):
            self.setFillColor(HexColor("#000000"))
            self.rect(0, 0, letter[0], letter[1], fill=1, stroke=0)
            super().showPage()

    doc = SimpleDocTemplate(buf, pagesize=letter, leftMargin=0.75*inch, rightMargin=0.75*inch, topMargin=0.9*inch, bottomMargin=0.75*inch)
    styles = getSampleStyleSheet()
    cover = ParagraphStyle('cover', parent=styles['Title'], textColor=white, fontSize=42, leading=46, alignment=0)
    h1 = ParagraphStyle('h1', parent=styles['Heading1'], textColor=white, fontSize=22, leading=28, spaceAfter=12, alignment=0)
    body = ParagraphStyle('body', parent=styles['BodyText'], textColor=HexColor('#A6A6A6'), fontSize=11, leading=17, alignment=0)
    caption = ParagraphStyle('cap', parent=styles['BodyText'], textColor=HexColor('#666666'), fontSize=8, leading=12, alignment=0, spaceAfter=20)

    story = []
    story.append(Paragraph("AINTRIX", cover))
    story.append(Paragraph("GLOBAL PRIVATE LIMITED", ParagraphStyle('sub', parent=styles['Normal'], textColor=HexColor('#A6A6A6'), fontSize=11, leading=14, spaceAfter=40)))
    story.append(Spacer(1, 200))
    story.append(Paragraph("Engineering Tomorrow.", h1))
    story.append(Paragraph("Across Technology, Innovation &amp; Sustainable Growth.", h1))
    story.append(Spacer(1, 30))
    story.append(Paragraph("INVESTOR OVERVIEW · CONFIDENTIAL · 2026", caption))
    story.append(PageBreak())

    def page(title, paragraphs):
        story.append(Paragraph(title, h1))
        story.append(Spacer(1, 12))
        for p in paragraphs:
            story.append(Paragraph(p, body))
            story.append(Spacer(1, 8))
        story.append(PageBreak())

    page("Company at a Glance", [
        "AINTRIX Global Private Limited is a future-driven multi-sector organization building intelligent technologies, creative infrastructure, and sustainable businesses.",
        "We operate across eight industries: Artificial Intelligence, Information Technology, Creative Infrastructure (RYZE), Fashion &amp; Apparel, Semiconductor Technology, Robotics &amp; Automation, Logistics &amp; Trade, and Sustainable Food Systems.",
        "Founded on the premise that the next century of value creation will be compound — across disciplines, geographies, and time horizons.",
    ])

    page("Vision &amp; Mission", [
        "Vision — To be a globally scalable innovation company building the future across industries.",
        "Mission — Create long-term impact through technology, research, innovation, and responsible business development.",
        "Philosophy — Innovation without discipline cannot achieve sustainable success.",
    ])

    page("The Ecosystem", [
        "01 · Artificial Intelligence — Foundation models and applied research.",
        "02 · Information Technology — Enterprise platforms and infrastructure.",
        "03 · RYZE (Creative Infrastructure) — Brand, media, and digital ecosystems.",
        "04 · Fashion &amp; Apparel — Category-defining lifestyle brands.",
        "05 · Semiconductor Technology — Custom silicon for AI and edge workloads.",
        "06 · Robotics &amp; Automation — Perception, manipulation, autonomy.",
        "07 · Logistics &amp; Trade — Global movement and market access.",
        "08 · Sustainable Food Systems — Closed-loop cultivation and distribution.",
    ])

    page("Contact", [
        "For investor inquiries, please write to invest@aintrix.com.",
        "This document is confidential and intended only for the recipient.",
    ])

    doc.build(story, canvasmaker=DeckCanvas)
    buf.seek(0)
    return buf

@api.get("/investor-deck/download")
async def download_deck():
    buf = _build_deck_pdf()
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="AINTRIX_Investor_Deck.pdf"'},
    )

# -----------------------------------------------------------------------------
# Public — Careers
# -----------------------------------------------------------------------------
@api.get("/jobs")
async def list_jobs(conn = Depends(get_db)):
    jobs = await conn.fetch(
        "SELECT * FROM jobs WHERE published = true ORDER BY created_at DESC LIMIT 200"
    )
    return serialize_records(jobs)

@api.post("/career-applications")
async def submit_career(payload: CareerApplicationIn, conn = Depends(get_db)):
    result = await conn.fetchrow(
        """
        INSERT INTO career_applications 
        (full_name, email, phone, position, location, experience_years, linkedin, cover, resume_url, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
        """,
        payload.full_name,
        payload.email.lower().strip(),
        payload.phone,
        payload.position,
        payload.location,
        payload.experience_years,
        payload.linkedin,
        payload.cover,
        payload.resume_url,
        "new",
        now_utc()
    )
    return {"ok": True, "id": result["id"]}

# -----------------------------------------------------------------------------
# Public — Internships
# -----------------------------------------------------------------------------
@api.post("/internships")
async def submit_internship(payload: InternshipIn, conn = Depends(get_db)):
    result = await conn.fetchrow(
        """
        INSERT INTO internships 
        (full_name, email, phone, university, program, year, interest, portfolio, cover, resume_url, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
        """,
        payload.full_name,
        payload.email.lower().strip(),
        payload.phone,
        payload.university,
        payload.program,
        payload.year,
        payload.interest,
        payload.portfolio,
        payload.cover,
        payload.resume_url,
        "new",
        now_utc()
    )
    return {"ok": True, "id": result["id"]}

# -----------------------------------------------------------------------------
# Public — File upload (resumes)
# -----------------------------------------------------------------------------
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@api.post("/uploads/resume")
async def upload_resume(file: UploadFile = File(...)):
    ext = (file.filename or "").split(".")[-1].lower()
    if ext not in {"pdf", "doc", "docx"}:
        raise HTTPException(status_code=400, detail="Only PDF, DOC, DOCX allowed")
    fid = f"{uuid.uuid4().hex}.{ext}"
    path = os.path.join(UPLOAD_DIR, fid)
    with open(path, "wb") as f:
        f.write(await file.read())
    return {"ok": True, "url": f"/api/uploads/resume/{fid}", "filename": file.filename}

@api.get("/uploads/resume/{fid}")
async def get_resume(fid: str):
    path = os.path.join(UPLOAD_DIR, fid)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Not found")
    def iterfile():
        with open(path, "rb") as f:
            yield from f
    return StreamingResponse(iterfile(), media_type="application/octet-stream", headers={"Content-Disposition": f'attachment; filename="{fid}"'})

# -----------------------------------------------------------------------------
# Public — News & Research read
# -----------------------------------------------------------------------------
@api.get("/articles")
async def list_articles(category: Optional[str] = None, conn = Depends(get_db)):
    if category and category != "All":
        articles = await conn.fetch(
            "SELECT * FROM articles WHERE published = true AND category = $1 ORDER BY published_at DESC LIMIT 200",
            category
        )
    else:
        articles = await conn.fetch(
            "SELECT * FROM articles WHERE published = true ORDER BY published_at DESC LIMIT 200"
        )
    return serialize_records(articles)

@api.get("/articles/{slug}")
async def get_article(slug: str, conn = Depends(get_db)):
    article = await conn.fetchrow(
        "SELECT * FROM articles WHERE slug = $1 AND published = true",
        slug
    )
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return serialize_record(article)

@api.get("/research")
async def list_research(conn = Depends(get_db)):
    research = await conn.fetch(
        "SELECT * FROM research WHERE published = true ORDER BY created_at DESC LIMIT 200"
    )
    return serialize_records(research)

# -----------------------------------------------------------------------------
# Admin — dashboard read + write
# -----------------------------------------------------------------------------
@api.get("/admin/stats")
async def admin_stats(admin=Depends(get_current_admin), conn = Depends(get_db)):
    stats = {}
    stats["contacts"] = await conn.fetchval("SELECT COUNT(*) FROM contacts")
    stats["investor_leads"] = await conn.fetchval("SELECT COUNT(*) FROM investor_leads")
    stats["career_applications"] = await conn.fetchval("SELECT COUNT(*) FROM career_applications")
    stats["internships"] = await conn.fetchval("SELECT COUNT(*) FROM internships")
    stats["articles"] = await conn.fetchval("SELECT COUNT(*) FROM articles")
    stats["jobs"] = await conn.fetchval("SELECT COUNT(*) FROM jobs")
    return stats

@api.get("/admin/contacts")
async def admin_contacts(admin=Depends(get_current_admin), conn = Depends(get_db)):
    contacts = await conn.fetch("SELECT * FROM contacts ORDER BY created_at DESC LIMIT 500")
    return serialize_records(contacts)

@api.get("/admin/investor-leads")
async def admin_investor_leads(admin=Depends(get_current_admin), conn = Depends(get_db)):
    leads = await conn.fetch("SELECT * FROM investor_leads ORDER BY created_at DESC LIMIT 500")
    return serialize_records(leads)

@api.get("/admin/career-applications")
async def admin_career_apps(admin=Depends(get_current_admin), conn = Depends(get_db)):
    apps = await conn.fetch("SELECT * FROM career_applications ORDER BY created_at DESC LIMIT 500")
    return serialize_records(apps)

@api.get("/admin/internships")
async def admin_internships(admin=Depends(get_current_admin), conn = Depends(get_db)):
    internships = await conn.fetch("SELECT * FROM internships ORDER BY created_at DESC LIMIT 500")
    return serialize_records(internships)

@api.get("/admin/articles")
async def admin_articles(admin=Depends(get_current_admin), conn = Depends(get_db)):
    articles = await conn.fetch("SELECT * FROM articles ORDER BY created_at DESC LIMIT 500")
    return serialize_records(articles)

@api.post("/admin/articles")
async def admin_create_article(payload: ArticleIn, admin=Depends(get_current_admin), conn = Depends(get_db)):
    # Check slug uniqueness
    existing = await conn.fetchval("SELECT id FROM articles WHERE slug = $1", payload.slug)
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    
    published_at = now_utc() if payload.published else None
    
    result = await conn.fetchrow(
        """
        INSERT INTO articles (title, slug, category, excerpt, body, cover_image, author, published, created_at, published_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
        """,
        payload.title,
        payload.slug,
        payload.category,
        payload.excerpt,
        payload.body,
        payload.cover_image,
        payload.author,
        payload.published,
        now_utc(),
        published_at
    )
    return {"ok": True, "id": result["id"]}

@api.put("/admin/articles/{article_id}")
async def admin_update_article(article_id: int, payload: ArticleIn, admin=Depends(get_current_admin), conn = Depends(get_db)):
    existing = await conn.fetchrow("SELECT * FROM articles WHERE id = $1", article_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Not found")
    
    published_at = existing["published_at"]
    if payload.published and not existing["published"]:
        published_at = now_utc()
    
    await conn.execute(
        """
        UPDATE articles 
        SET title = $1, slug = $2, category = $3, excerpt = $4, body = $5, 
            cover_image = $6, author = $7, published = $8, published_at = $9
        WHERE id = $10
        """,
        payload.title,
        payload.slug,
        payload.category,
        payload.excerpt,
        payload.body,
        payload.cover_image,
        payload.author,
        payload.published,
        published_at,
        article_id
    )
    return {"ok": True}

@api.delete("/admin/articles/{article_id}")
async def admin_delete_article(article_id: int, admin=Depends(get_current_admin), conn = Depends(get_db)):
    await conn.execute("DELETE FROM articles WHERE id = $1", article_id)
    return {"ok": True}

@api.get("/admin/jobs")
async def admin_jobs(admin=Depends(get_current_admin), conn = Depends(get_db)):
    jobs = await conn.fetch("SELECT * FROM jobs ORDER BY created_at DESC LIMIT 500")
    return serialize_records(jobs)

@api.post("/admin/jobs")
async def admin_create_job(payload: JobIn, admin=Depends(get_current_admin), conn = Depends(get_db)):
    result = await conn.fetchrow(
        """
        INSERT INTO jobs (title, department, location, type, description, requirements, published, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
        """,
        payload.title,
        payload.department,
        payload.location,
        payload.type,
        payload.description,
        json.dumps(payload.requirements),
        payload.published,
        now_utc()
    )
    return {"ok": True, "id": result["id"]}

@api.delete("/admin/jobs/{job_id}")
async def admin_delete_job(job_id: int, admin=Depends(get_current_admin), conn = Depends(get_db)):
    await conn.execute("DELETE FROM jobs WHERE id = $1", job_id)
    return {"ok": True}

# -----------------------------------------------------------------------------
# Mount API router
# -----------------------------------------------------------------------------
app.include_router(api)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

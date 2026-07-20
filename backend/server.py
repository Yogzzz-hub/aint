"""AINTRIX Global — FastAPI backend
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
from typing import Optional, List, Annotated
from bson import ObjectId

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr, Field, BeforeValidator
from motor.motor_asyncio import AsyncIOMotorClient

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white, black
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.pdfgen import canvas as pdfcanvas

# -----------------------------------------------------------------------------
# App + DB setup
# -----------------------------------------------------------------------------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALG = "HS256"
ACCESS_TTL_MIN = 60 * 24  # 24h — admin sessions

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="AINTRIX Global API", version="1.0.0")
api = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
PyObjectId = Annotated[str, BeforeValidator(lambda x: str(x) if isinstance(x, ObjectId) else x)]

def now_utc() -> datetime:
    return datetime.now(timezone.utc)

def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False

def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": now_utc() + timedelta(minutes=ACCESS_TTL_MIN),
        "type": "access",
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def serialize(doc: dict) -> dict:
    if not doc:
        return doc
    if "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    for k, v in list(doc.items()):
        if isinstance(v, datetime):
            doc[k] = v.isoformat()
        if isinstance(v, ObjectId):
            doc[k] = str(v)
    return doc

async def get_current_admin(request: Request) -> dict:
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
    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    user.pop("password_hash", None)
    return serialize(user)

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
    type: str  # Full-time / Part-time / Contract
    description: str
    requirements: List[str] = []
    published: bool = True

# -----------------------------------------------------------------------------
# Startup — seed admin + indexes + demo content
# -----------------------------------------------------------------------------
DEMO_JOBS = [
    {
        "title": "Senior AI Research Engineer",
        "department": "Artificial Intelligence",
        "location": "Remote / Bangalore",
        "type": "Full-time",
        "description": "Lead applied research in foundation models, agentic systems, and multimodal reasoning across the AINTRIX AI division.",
        "requirements": [
            "PhD or MS in ML / CS with 5+ years applied research",
            "Deep understanding of transformer architectures",
            "Publications at NeurIPS / ICML / ICLR preferred",
            "Fluent in PyTorch, JAX, or equivalent",
        ],
        "published": True,
    },
    {
        "title": "Semiconductor Design Engineer",
        "department": "Semiconductor Technology",
        "location": "Bangalore",
        "type": "Full-time",
        "description": "Drive RTL to GDSII flow for AINTRIX proprietary silicon. Own architecture through tape-out.",
        "requirements": [
            "Bachelors / Masters in ECE / VLSI",
            "6+ years RTL design, DFT, synthesis",
            "Experience with 7nm / 5nm nodes advantageous",
        ],
        "published": True,
    },
    {
        "title": "Creative Director — RYZE",
        "department": "Creative Infrastructure",
        "location": "Mumbai / Remote",
        "type": "Full-time",
        "description": "Lead brand and creative direction across RYZE's client and internal portfolios. Editorial-first, media-native, technology-fluent.",
        "requirements": [
            "10+ years brand and design leadership",
            "Portfolio spanning identity, motion, and product",
            "Comfortable in ambiguity, obsessive about craft",
        ],
        "published": True,
    },
    {
        "title": "Robotics Systems Engineer",
        "department": "Robotics & Automation",
        "location": "Chennai",
        "type": "Full-time",
        "description": "Architect autonomous perception and manipulation stacks for AINTRIX robotics platforms.",
        "requirements": [
            "MS in Robotics / Mechatronics",
            "ROS2, C++, and perception fluency",
            "SLAM, sensor fusion, real-time systems",
        ],
        "published": True,
    },
    {
        "title": "Full-Stack Engineer",
        "department": "Information Technology",
        "location": "Remote",
        "type": "Full-time",
        "description": "Build customer-facing platforms across AINTRIX's IT and creative properties.",
        "requirements": [
            "4+ years React / Node / Python",
            "Systems thinking, product intuition",
            "Bias for shipping",
        ],
        "published": True,
    },
]

DEMO_ARTICLES = [
    {
        "title": "The AINTRIX Manifesto — Building the Century of Compound Innovation",
        "slug": "aintrix-manifesto-century-of-compound-innovation",
        "category": "Editorial",
        "excerpt": "A future engineered across disciplines. Our commitment to a multi-sector, research-first company.",
        "body": "AINTRIX Global was formed from a simple premise: the next century of technology will not belong to specialists. It will belong to the organizations that can move fluidly between silicon and cinema, between models and matter. This is our manifesto.\n\nWe do not build in isolation. Our AI research shapes our robotics stack. Our creative infrastructure amplifies our semiconductor narrative. Our food systems draw on our logistics discipline. Compound innovation is the point.\n\nDiscipline is the counterweight to velocity. Innovation without discipline cannot achieve sustainable success. Every decision at AINTRIX is measured against long-term durability — not quarterly optics.",
        "cover_image": "https://images.unsplash.com/photo-1698429894841-64b7d0396aa7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGdlb21ldHJpYyUyMDNkJTIwbW9ub2Nocm9tZXxlbnwwfHx8fDE3ODQ1NTgzMzN8MA&ixlib=rb-4.1.0&q=85",
        "author": "AINTRIX Editorial",
        "published": True,
    },
    {
        "title": "RYZE Establishes Creative Infrastructure Division",
        "slug": "ryze-establishes-creative-infrastructure-division",
        "category": "Announcements",
        "excerpt": "RYZE launches as AINTRIX's dedicated brand, media, and digital ecosystem partner for long-term growth.",
        "body": "RYZE — established in 2024 — now sits at the intersection of technology, design, and media. Its role: shape brand narratives with the same rigor we apply to engineering. Every deliverable is a system.\n\nThe division works with founders and operators to compound distribution across product, design, and storytelling. Expect the RYZE portfolio to expand aggressively through 2026.",
        "cover_image": "https://images.pexels.com/photos/13978499/pexels-photo-13978499.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "author": "AINTRIX Newsroom",
        "published": True,
    },
    {
        "title": "Semiconductor Research: Progress Toward AINTRIX Silicon",
        "slug": "semiconductor-research-progress-aintrix-silicon",
        "category": "Research",
        "excerpt": "A quiet update on our multi-year silicon program — from architecture to first tape-out plans.",
        "body": "Since our patent work in 2022, AINTRIX has quietly built a semiconductor research group. We are pursuing domain-specific accelerators purpose-built for our AI and robotics stacks.\n\nThe program is deliberately long-horizon. We publish sparingly. We share here as a signal of intent, not a marketing exercise.",
        "cover_image": "https://images.unsplash.com/photo-1763372278600-fd0b0997a7b8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHwzfHxzZW1pY29uZHVjdG9yJTIwbWljcm9jaGlwJTIwY2xvc2UlMjB1cCUyMG1vbm9jaHJvbWV8ZW58MHx8fHwxNzg0NTU4MzE4fDA&ixlib=rb-4.1.0&q=85",
        "author": "Research Desk",
        "published": True,
    },
]

DEMO_RESEARCH = [
    {
        "title": "Foundation Models for Multi-Domain Agents",
        "domain": "Artificial Intelligence",
        "summary": "Investigating unified agentic architectures that generalize across enterprise, creative, and physical domains.",
        "body": "Our AI research group is building foundation models tuned for AINTRIX's cross-domain deployment surface — from creative work at RYZE to robotics perception. The core hypothesis: shared representations across modalities compound utility faster than domain-siloed models.",
        "cover_image": "https://images.pexels.com/photos/29054364/pexels-photo-29054364.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "published": True,
    },
    {
        "title": "Autonomous Manipulation for Industrial Robotics",
        "domain": "Robotics & Automation",
        "summary": "Closed-loop perception and manipulation on commodity hardware.",
        "body": "We are exploring low-latency perception-to-action loops using multi-view stereo, contact-rich policy learning, and cost-optimized actuation.",
        "cover_image": "https://images.pexels.com/photos/29054365/pexels-photo-29054365.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "published": True,
    },
    {
        "title": "Custom Silicon for Edge Inference",
        "domain": "Semiconductor Technology",
        "summary": "Sparse-attention accelerators targeting sub-watt edge inference for robotics and IoT.",
        "body": "Architecture research on quantized sparse-attention silicon with programmable dataflow — targeting AINTRIX robotics and industrial IoT.",
        "cover_image": "https://images.unsplash.com/photo-1561972465-05c968dc2c91?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHwxfHxzZW1pY29uZHVjdG9yJTIwbWljcm9jaGlwJTIwY2xvc2UlMjB1cCUyMG1vbm9jaHJvbWV8ZW58MHx8fHwxNzg0NTU4MzE4fDA&ixlib=rb-4.1.0&q=85",
        "published": True,
    },
    {
        "title": "Sustainable Food Systems Pilot",
        "domain": "Food Systems",
        "summary": "Vertical, closed-loop cultivation with computer-vision quality control.",
        "body": "A pilot program combining vertical farming, ML-driven yield forecasting, and closed-loop nutrient systems — designed to be replicable across urban centers.",
        "cover_image": "https://images.unsplash.com/photo-1780273035805-9c3f782af91a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NjZ8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwZW5naW5lZXJpbmclMjBtb25vY2hyb21lfGVufDB8fHx8MTc4Mjk2MTk4NXww&ixlib=rb-4.1.0&q=85",
        "published": True,
    },
]

@app.on_event("startup")
async def on_startup():
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.articles.create_index("slug", unique=True)
    await db.contacts.create_index("created_at")
    await db.investor_leads.create_index("email")

    # Seed admin (idempotent)
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@aintrix.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Aintrix@2026")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "AINTRIX Admin",
            "role": "admin",
            "created_at": now_utc(),
        })
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )

    # Seed demo jobs
    if await db.jobs.count_documents({}) == 0:
        for j in DEMO_JOBS:
            j2 = {**j, "created_at": now_utc()}
            await db.jobs.insert_one(j2)

    # Seed demo articles
    for a in DEMO_ARTICLES:
        if not await db.articles.find_one({"slug": a["slug"]}):
            a2 = {**a, "created_at": now_utc(), "published_at": now_utc()}
            await db.articles.insert_one(a2)

    # Seed demo research
    if await db.research.count_documents({}) == 0:
        for r in DEMO_RESEARCH:
            r2 = {**r, "created_at": now_utc()}
            await db.research.insert_one(r2)


# -----------------------------------------------------------------------------
# Health
# -----------------------------------------------------------------------------
@api.get("/")
async def root():
    return {"status": "ok", "service": "AINTRIX Global API"}

@api.get("/health")
async def health():
    return {"ok": True, "ts": now_utc().isoformat()}

# -----------------------------------------------------------------------------
# Auth
# -----------------------------------------------------------------------------
@api.post("/auth/login")
async def login(payload: LoginIn):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    token = create_access_token(str(user["_id"]), user["email"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": str(user["_id"]), "email": user["email"], "name": user.get("name"), "role": user.get("role")},
    }

@api.get("/auth/me")
async def me(admin=Depends(get_current_admin)):
    return admin

# -----------------------------------------------------------------------------
# Public — Contacts
# -----------------------------------------------------------------------------
@api.post("/contacts")
async def submit_contact(payload: ContactIn):
    doc = {
        **payload.model_dump(),
        "email": payload.email.lower().strip(),
        "created_at": now_utc(),
        "status": "new",
    }
    r = await db.contacts.insert_one(doc)
    return {"ok": True, "id": str(r.inserted_id)}

# -----------------------------------------------------------------------------
# Public — Investor Leads + Deck download
# -----------------------------------------------------------------------------
@api.post("/investor-leads")
async def submit_investor_lead(payload: InvestorLeadIn):
    doc = {
        **payload.model_dump(),
        "email": payload.email.lower().strip(),
        "created_at": now_utc(),
    }
    await db.investor_leads.insert_one(doc)
    return {"ok": True, "download_url": "/api/investor-deck/download"}

def _build_deck_pdf() -> io.BytesIO:
    """Programmatically generate an editorial monochrome investor deck PDF."""
    buf = io.BytesIO()

    class DeckCanvas(pdfcanvas.Canvas):
        def showPage(self):
            self.setFillColor(HexColor("#000000"))
            self.rect(0, 0, letter[0], letter[1], fill=1, stroke=0)
            super().showPage()

    # Build cover manually then flowables
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
        "Mission — Create long-term impact through technology, research, innovation, and responsible business development. Build solutions across multiple industries while maintaining sustainability and continuous innovation.",
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

    page("Journey", [
        "2020 — Research begins.",
        "2021 — Fast Forward Brand.",
        "2022 — Patent acquisition and dedicated AI research.",
        "2024 — RYZE established.",
        "2025 — AINTRIX Global Private Limited incorporated.",
    ])

    page("Why AINTRIX", [
        "Compound advantage — Multi-domain research and shared infrastructure across divisions.",
        "Discipline — Long-horizon capital allocation; no quarterly noise.",
        "Craft — Every product held to editorial standard.",
        "Talent — Cross-disciplinary founders, engineers, designers, and researchers.",
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
async def list_jobs():
    jobs = await db.jobs.find({"published": True}).sort("created_at", -1).to_list(200)
    return [serialize(j) for j in jobs]

@api.post("/career-applications")
async def submit_career(payload: CareerApplicationIn):
    doc = {**payload.model_dump(), "email": payload.email.lower().strip(), "created_at": now_utc(), "status": "new"}
    r = await db.career_applications.insert_one(doc)
    return {"ok": True, "id": str(r.inserted_id)}

# -----------------------------------------------------------------------------
# Public — Internships
# -----------------------------------------------------------------------------
@api.post("/internships")
async def submit_internship(payload: InternshipIn):
    doc = {**payload.model_dump(), "email": payload.email.lower().strip(), "created_at": now_utc(), "status": "new"}
    r = await db.internships.insert_one(doc)
    return {"ok": True, "id": str(r.inserted_id)}

# -----------------------------------------------------------------------------
# Public — File upload (resumes)
# -----------------------------------------------------------------------------
UPLOAD_DIR = "/app/backend/uploads"
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
async def list_articles(category: Optional[str] = None):
    q = {"published": True}
    if category and category != "All":
        q["category"] = category
    items = await db.articles.find(q).sort("published_at", -1).to_list(200)
    return [serialize(a) for a in items]

@api.get("/articles/{slug}")
async def get_article(slug: str):
    a = await db.articles.find_one({"slug": slug, "published": True})
    if not a:
        raise HTTPException(status_code=404, detail="Article not found")
    return serialize(a)

@api.get("/research")
async def list_research():
    items = await db.research.find({"published": True}).sort("created_at", -1).to_list(200)
    return [serialize(x) for x in items]

# -----------------------------------------------------------------------------
# Admin — dashboard read + write
# -----------------------------------------------------------------------------
@api.get("/admin/stats")
async def admin_stats(admin=Depends(get_current_admin)):
    return {
        "contacts": await db.contacts.count_documents({}),
        "investor_leads": await db.investor_leads.count_documents({}),
        "career_applications": await db.career_applications.count_documents({}),
        "internships": await db.internships.count_documents({}),
        "articles": await db.articles.count_documents({}),
        "jobs": await db.jobs.count_documents({}),
    }

@api.get("/admin/contacts")
async def admin_contacts(admin=Depends(get_current_admin)):
    items = await db.contacts.find({}).sort("created_at", -1).to_list(500)
    return [serialize(x) for x in items]

@api.get("/admin/investor-leads")
async def admin_investor_leads(admin=Depends(get_current_admin)):
    items = await db.investor_leads.find({}).sort("created_at", -1).to_list(500)
    return [serialize(x) for x in items]

@api.get("/admin/career-applications")
async def admin_career_apps(admin=Depends(get_current_admin)):
    items = await db.career_applications.find({}).sort("created_at", -1).to_list(500)
    return [serialize(x) for x in items]

@api.get("/admin/internships")
async def admin_internships(admin=Depends(get_current_admin)):
    items = await db.internships.find({}).sort("created_at", -1).to_list(500)
    return [serialize(x) for x in items]

@api.get("/admin/articles")
async def admin_articles(admin=Depends(get_current_admin)):
    items = await db.articles.find({}).sort("created_at", -1).to_list(500)
    return [serialize(x) for x in items]

@api.post("/admin/articles")
async def admin_create_article(payload: ArticleIn, admin=Depends(get_current_admin)):
    doc = payload.model_dump()
    if await db.articles.find_one({"slug": doc["slug"]}):
        raise HTTPException(status_code=400, detail="Slug already exists")
    doc.update({"created_at": now_utc(), "published_at": now_utc() if doc.get("published") else None})
    r = await db.articles.insert_one(doc)
    return {"ok": True, "id": str(r.inserted_id)}

@api.put("/admin/articles/{article_id}")
async def admin_update_article(article_id: str, payload: ArticleIn, admin=Depends(get_current_admin)):
    doc = payload.model_dump()
    existing = await db.articles.find_one({"_id": ObjectId(article_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Not found")
    if doc.get("published") and not existing.get("published"):
        doc["published_at"] = now_utc()
    await db.articles.update_one({"_id": ObjectId(article_id)}, {"$set": doc})
    return {"ok": True}

@api.delete("/admin/articles/{article_id}")
async def admin_delete_article(article_id: str, admin=Depends(get_current_admin)):
    await db.articles.delete_one({"_id": ObjectId(article_id)})
    return {"ok": True}

@api.get("/admin/jobs")
async def admin_jobs(admin=Depends(get_current_admin)):
    items = await db.jobs.find({}).sort("created_at", -1).to_list(500)
    return [serialize(x) for x in items]

@api.post("/admin/jobs")
async def admin_create_job(payload: JobIn, admin=Depends(get_current_admin)):
    doc = {**payload.model_dump(), "created_at": now_utc()}
    r = await db.jobs.insert_one(doc)
    return {"ok": True, "id": str(r.inserted_id)}

@api.delete("/admin/jobs/{job_id}")
async def admin_delete_job(job_id: str, admin=Depends(get_current_admin)):
    await db.jobs.delete_one({"_id": ObjectId(job_id)})
    return {"ok": True}


app.include_router(api)

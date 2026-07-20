"""AINTRIX Global Backend API — pytest suite.
Covers: health, public reads (jobs/articles/research), public writes
(contacts/investor-leads/careers/internships/uploads), auth, and admin
CRUD boundaries.
"""
import io
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://aintrix-craft.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@aintrix.com"
ADMIN_PASSWORD = "Aintrix@2026"


# ---------------------------------------------------------------- fixtures
@pytest.fixture(scope="session")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


@pytest.fixture(scope="session")
def token(s):
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ---------------------------------------------------------------- health
def test_health(s):
    r = s.get(f"{API}/health")
    assert r.status_code == 200
    assert r.json().get("ok") is True


# ---------------------------------------------------------------- public reads
def test_jobs_list(s):
    r = s.get(f"{API}/jobs")
    assert r.status_code == 200
    jobs = r.json()
    assert isinstance(jobs, list)
    assert len(jobs) >= 5
    titles = [j["title"] for j in jobs]
    assert "Senior AI Research Engineer" in titles
    assert "Semiconductor Design Engineer" in titles
    assert any("RYZE" in t for t in titles)


def test_articles_list(s):
    r = s.get(f"{API}/articles")
    assert r.status_code == 200
    arts = r.json()
    assert isinstance(arts, list)
    assert len(arts) >= 3


def test_articles_filter_editorial(s):
    r = s.get(f"{API}/articles", params={"category": "Editorial"})
    assert r.status_code == 200
    arts = r.json()
    assert len(arts) >= 1
    assert all(a["category"] == "Editorial" for a in arts)


def test_article_by_slug(s):
    slug = "aintrix-manifesto-century-of-compound-innovation"
    r = s.get(f"{API}/articles/{slug}")
    assert r.status_code == 200, r.text
    a = r.json()
    assert a["slug"] == slug
    assert a["title"].startswith("The AINTRIX Manifesto")
    assert "body" in a and len(a["body"]) > 0


def test_research_list(s):
    r = s.get(f"{API}/research")
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    assert len(items) >= 4


# ---------------------------------------------------------------- public writes
def test_contact_create(s):
    r = s.post(f"{API}/contacts", json={
        "name": "TEST_Contact",
        "email": "test_contact@example.com",
        "company": "TestCo",
        "subject": "Hello",
        "message": "Test message",
    })
    assert r.status_code == 200
    d = r.json()
    assert d.get("ok") is True and "id" in d


def test_investor_lead_and_deck(s):
    r = s.post(f"{API}/investor-leads", json={
        "name": "TEST_Investor",
        "email": "test_investor@example.com",
        "company": "Fund",
        "role": "GP",
    })
    assert r.status_code == 200
    d = r.json()
    assert d.get("ok") is True
    assert d.get("download_url") == "/api/investor-deck/download"

    r2 = s.get(f"{API}/investor-deck/download")
    assert r2.status_code == 200
    assert r2.headers.get("content-type", "").startswith("application/pdf")
    assert len(r2.content) > 500
    assert r2.content[:4] == b"%PDF"


def test_career_application(s):
    r = s.post(f"{API}/career-applications", json={
        "full_name": "TEST_Applicant",
        "email": "test_applicant@example.com",
        "phone": "555",
        "position": "Senior AI Research Engineer",
        "location": "Remote",
        "experience_years": "5",
        "linkedin": "",
        "cover": "I am interested.",
        "resume_url": "",
    })
    assert r.status_code == 200
    assert r.json().get("ok") is True


def test_internship_application(s):
    r = s.post(f"{API}/internships", json={
        "full_name": "TEST_Intern",
        "email": "test_intern@example.com",
        "phone": "555",
        "university": "IIT",
        "program": "BTech CS",
        "year": "3",
        "interest": "AI Research",
        "portfolio": "",
        "cover": "Passionate about AI.",
        "resume_url": "",
    })
    assert r.status_code == 200
    assert r.json().get("ok") is True


def test_upload_resume_pdf():
    fake_pdf = b"%PDF-1.4\n%test\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n"
    files = {"file": ("resume.pdf", io.BytesIO(fake_pdf), "application/pdf")}
    r = requests.post(f"{API}/uploads/resume", files=files)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d.get("ok") is True
    assert d["url"].startswith("/api/uploads/resume/")


def test_upload_resume_rejects_bad_ext():
    files = {"file": ("resume.txt", io.BytesIO(b"nope"), "text/plain")}
    r = requests.post(f"{API}/uploads/resume", files=files)
    assert r.status_code == 400


# ---------------------------------------------------------------- auth
def test_login_success(s):
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200
    d = r.json()
    assert "access_token" in d
    assert d["user"]["email"] == ADMIN_EMAIL
    assert d["user"]["role"] == "admin"


def test_login_wrong_password(s):
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
    assert r.status_code == 401


def test_me_with_token(s, auth_headers):
    r = s.get(f"{API}/auth/me", headers=auth_headers)
    assert r.status_code == 200
    d = r.json()
    assert d["email"] == ADMIN_EMAIL
    assert d["role"] == "admin"


def test_me_without_token():
    r = requests.get(f"{API}/auth/me")
    assert r.status_code == 401


# ---------------------------------------------------------------- admin reads
def test_admin_stats(s, auth_headers):
    r = s.get(f"{API}/admin/stats", headers=auth_headers)
    assert r.status_code == 200
    d = r.json()
    for k in ("contacts", "investor_leads", "career_applications", "internships", "articles", "jobs"):
        assert k in d and isinstance(d[k], int)


@pytest.mark.parametrize("path", [
    "/admin/contacts", "/admin/investor-leads", "/admin/career-applications",
    "/admin/internships", "/admin/articles", "/admin/jobs",
])
def test_admin_list_endpoints(s, auth_headers, path):
    r = s.get(f"{API}{path}", headers=auth_headers)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ---------------------------------------------------------------- admin CRUD - articles
def test_admin_article_crud(s, auth_headers):
    slug = "test-article-crud-2026"
    # cleanup existing
    lst = s.get(f"{API}/admin/articles", headers=auth_headers).json()
    for a in lst:
        if a.get("slug") == slug:
            s.delete(f"{API}/admin/articles/{a['id']}", headers=auth_headers)

    payload = {
        "title": "TEST Article",
        "slug": slug,
        "category": "Editorial",
        "excerpt": "excerpt",
        "body": "body",
        "cover_image": "",
        "author": "Tester",
        "published": True,
    }
    r = s.post(f"{API}/admin/articles", headers=auth_headers, json=payload)
    assert r.status_code == 200, r.text
    aid = r.json()["id"]

    # duplicate slug
    r_dup = s.post(f"{API}/admin/articles", headers=auth_headers, json=payload)
    assert r_dup.status_code == 400

    # update
    payload["title"] = "TEST Article Updated"
    r_up = s.put(f"{API}/admin/articles/{aid}", headers=auth_headers, json=payload)
    assert r_up.status_code == 200

    # verify via public slug endpoint
    r_get = s.get(f"{API}/articles/{slug}")
    assert r_get.status_code == 200
    assert r_get.json()["title"] == "TEST Article Updated"

    # delete
    r_del = s.delete(f"{API}/admin/articles/{aid}", headers=auth_headers)
    assert r_del.status_code == 200

    # verify gone
    r_gone = s.get(f"{API}/articles/{slug}")
    assert r_gone.status_code == 404


# ---------------------------------------------------------------- admin CRUD - jobs
def test_admin_job_create_delete(s, auth_headers):
    payload = {
        "title": "TEST Job",
        "department": "QA",
        "location": "Remote",
        "type": "Full-time",
        "description": "test",
        "requirements": ["r1"],
        "published": True,
    }
    r = s.post(f"{API}/admin/jobs", headers=auth_headers, json=payload)
    assert r.status_code == 200
    jid = r.json()["id"]
    r_del = s.delete(f"{API}/admin/jobs/{jid}", headers=auth_headers)
    assert r_del.status_code == 200


# ---------------------------------------------------------------- admin auth boundaries
@pytest.mark.parametrize("path,method", [
    ("/admin/stats", "get"),
    ("/admin/contacts", "get"),
    ("/admin/investor-leads", "get"),
    ("/admin/career-applications", "get"),
    ("/admin/internships", "get"),
    ("/admin/articles", "get"),
    ("/admin/jobs", "get"),
    ("/admin/articles", "post"),
    ("/admin/jobs", "post"),
])
def test_admin_requires_auth(path, method):
    fn = getattr(requests, method)
    kwargs = {"json": {}} if method == "post" else {}
    r = fn(f"{API}{path}", **kwargs)
    assert r.status_code in (401, 403), f"{path} returned {r.status_code}"

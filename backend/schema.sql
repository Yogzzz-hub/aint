-- AINTRIX Global PostgreSQL Schema
-- Drop existing tables (for clean setup)
DROP TABLE IF EXISTS career_applications CASCADE;
DROP TABLE IF EXISTS internships CASCADE;
DROP TABLE IF EXISTS investor_leads CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS research CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (admin authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Articles table (news/blog posts)
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    excerpt TEXT NOT NULL,
    body TEXT NOT NULL,
    cover_image TEXT,
    author VARCHAR(255) DEFAULT 'AINTRIX Editorial',
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_published ON articles(published);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);

-- Jobs table (career opportunities)
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    department VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    requirements JSONB DEFAULT '[]',
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobs_published ON jobs(published);
CREATE INDEX idx_jobs_department ON jobs(department);

-- Research posts table
CREATE TABLE research (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    body TEXT NOT NULL,
    cover_image TEXT,
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_research_published ON research(published);
CREATE INDEX idx_research_domain ON research(domain);

-- Contacts table (general inquiries)
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    subject VARCHAR(500),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);

-- Investor leads table
CREATE TABLE investor_leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    role VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_investor_leads_email ON investor_leads(email);
CREATE INDEX idx_investor_leads_created_at ON investor_leads(created_at DESC);

-- Internship applications table
CREATE TABLE internships (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    university VARCHAR(255) NOT NULL,
    program VARCHAR(255) NOT NULL,
    year VARCHAR(50) NOT NULL,
    interest VARCHAR(500) NOT NULL,
    portfolio TEXT,
    cover TEXT NOT NULL,
    resume_url TEXT,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_internships_email ON internships(email);
CREATE INDEX idx_internships_status ON internships(status);
CREATE INDEX idx_internships_created_at ON internships(created_at DESC);

-- Career applications table
CREATE TABLE career_applications (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    position VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    experience_years VARCHAR(50),
    linkedin TEXT,
    cover TEXT NOT NULL,
    resume_url TEXT,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_career_applications_email ON career_applications(email);
CREATE INDEX idx_career_applications_position ON career_applications(position);
CREATE INDEX idx_career_applications_status ON career_applications(status);
CREATE INDEX idx_career_applications_created_at ON career_applications(created_at DESC);

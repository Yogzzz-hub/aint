-- AINTRIX Global PostgreSQL Seed Data
-- Clear existing data
TRUNCATE TABLE career_applications, internships, investor_leads, contacts, research, jobs, articles, users RESTART IDENTITY CASCADE;

-- Seed admin user (password: Aintrix@2026)
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@aintrix.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxF6q0OKe', 'AINTRIX Admin', 'admin');

-- Seed demo jobs
INSERT INTO jobs (title, department, location, type, description, requirements, published) VALUES
('Senior AI Research Engineer', 'Artificial Intelligence', 'Remote / Bangalore', 'Full-time', 
 'Lead applied research in foundation models, agentic systems, and multimodal reasoning across the AINTRIX AI division.',
 '["PhD or MS in ML / CS with 5+ years applied research", "Deep understanding of transformer architectures", "Publications at NeurIPS / ICML / ICLR preferred", "Fluent in PyTorch, JAX, or equivalent"]',
 true),

('Semiconductor Design Engineer', 'Semiconductor Technology', 'Bangalore', 'Full-time',
 'Drive RTL to GDSII flow for AINTRIX proprietary silicon. Own architecture through tape-out.',
 '["Bachelors / Masters in ECE / VLSI", "6+ years RTL design, DFT, synthesis", "Experience with 7nm / 5nm nodes advantageous"]',
 true),

('Creative Director — RYZE', 'Creative Infrastructure', 'Mumbai / Remote', 'Full-time',
 'Lead brand and creative direction across RYZE''s client and internal portfolios. Editorial-first, media-native, technology-fluent.',
 '["10+ years brand and design leadership", "Portfolio spanning identity, motion, and product", "Comfortable in ambiguity, obsessive about craft"]',
 true),

('Robotics Systems Engineer', 'Robotics & Automation', 'Chennai', 'Full-time',
 'Architect autonomous perception and manipulation stacks for AINTRIX robotics platforms.',
 '["MS in Robotics / Mechatronics", "ROS2, C++, and perception fluency", "SLAM, sensor fusion, real-time systems"]',
 true),

('Full-Stack Engineer', 'Information Technology', 'Remote', 'Full-time',
 'Build customer-facing platforms across AINTRIX''s IT and creative properties.',
 '["4+ years React / Node / Python", "Systems thinking, product intuition", "Bias for shipping"]',
 true);

-- Seed demo articles
INSERT INTO articles (title, slug, category, excerpt, body, cover_image, author, published, published_at) VALUES
('The AINTRIX Manifesto — Building the Century of Compound Innovation', 'aintrix-manifesto-century-of-compound-innovation', 'Editorial',
 'A future engineered across disciplines. Our commitment to a multi-sector, research-first company.',
 E'AINTRIX Global was formed from a simple premise: the next century of technology will not belong to specialists. It will belong to the organizations that can move fluidly between silicon and cinema, between models and matter. This is our manifesto.\n\nWe do not build in isolation. Our AI research shapes our robotics stack. Our creative infrastructure amplifies our semiconductor narrative. Our food systems draw on our logistics discipline. Compound innovation is the point.\n\nDiscipline is the counterweight to velocity. Innovation without discipline cannot achieve sustainable success. Every decision at AINTRIX is measured against long-term durability — not quarterly optics.',
 'https://images.unsplash.com/photo-1698429894841-64b7d0396aa7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGdlb21ldHJpYyUyMDNkJTIwbW9ub2Nocm9tZXxlbnwwfHx8fDE3ODQ1NTgzMzN8MA&ixlib=rb-4.1.0&q=85',
 'AINTRIX Editorial', true, CURRENT_TIMESTAMP),

('RYZE Establishes Creative Infrastructure Division', 'ryze-establishes-creative-infrastructure-division', 'Announcements',
 'RYZE launches as AINTRIX''s dedicated brand, media, and digital ecosystem partner for long-term growth.',
 E'RYZE — established in 2024 — now sits at the intersection of technology, design, and media. Its role: shape brand narratives with the same rigor we apply to engineering. Every deliverable is a system.\n\nThe division works with founders and operators to compound distribution across product, design, and storytelling. Expect the RYZE portfolio to expand aggressively through 2026.',
 'https://images.pexels.com/photos/13978499/pexels-photo-13978499.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 'AINTRIX Newsroom', true, CURRENT_TIMESTAMP),

('Semiconductor Research: Progress Toward AINTRIX Silicon', 'semiconductor-research-progress-aintrix-silicon', 'Research',
 'A quiet update on our multi-year silicon program — from architecture to first tape-out plans.',
 E'Since our patent work in 2022, AINTRIX has quietly built a semiconductor research group. We are pursuing domain-specific accelerators purpose-built for our AI and robotics stacks.\n\nThe program is deliberately long-horizon. We publish sparingly. We share here as a signal of intent, not a marketing exercise.',
 'https://images.unsplash.com/photo-1763372278600-fd0b0997a7b8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHwzfHxzZW1pY29uZHVjdG9yJTIwbWljcm9jaGlwJTIwY2xvc2UlMjB1cCUyMG1vbm9jaHJvbWV8ZW58MHx8fHwxNzg0NTU4MzE4fDA&ixlib=rb-4.1.0&q=85',
 'Research Desk', true, CURRENT_TIMESTAMP);

-- Seed demo research posts
INSERT INTO research (title, domain, summary, body, cover_image, published) VALUES
('Foundation Models for Multi-Domain Agents', 'Artificial Intelligence',
 'Investigating unified agentic architectures that generalize across enterprise, creative, and physical domains.',
 'Our AI research group is building foundation models tuned for AINTRIX''s cross-domain deployment surface — from creative work at RYZE to robotics perception. The core hypothesis: shared representations across modalities compound utility faster than domain-siloed models.',
 'https://images.pexels.com/photos/29054364/pexels-photo-29054364.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 true),

('Autonomous Manipulation for Industrial Robotics', 'Robotics & Automation',
 'Closed-loop perception and manipulation on commodity hardware.',
 'We are exploring low-latency perception-to-action loops using multi-view stereo, contact-rich policy learning, and cost-optimized actuation.',
 'https://images.pexels.com/photos/29054365/pexels-photo-29054365.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
 true),

('Custom Silicon for Edge Inference', 'Semiconductor Technology',
 'Sparse-attention accelerators targeting sub-watt edge inference for robotics and IoT.',
 'Architecture research on quantized sparse-attention silicon with programmable dataflow — targeting AINTRIX robotics and industrial IoT.',
 'https://images.unsplash.com/photo-1561972465-05c968dc2c91?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHwxfHxzZW1pY29uZHVjdG9yJTIwbWljcm9jaGlwJTIwY2xvc2UlMjB1cCUyMG1vbm9jaHJvbWV8ZW58MHx8fHwxNzg0NTU4MzE4fDA&ixlib=rb-4.1.0&q=85',
 true),

('Sustainable Food Systems Pilot', 'Food Systems',
 'Vertical, closed-loop cultivation with computer-vision quality control.',
 'A pilot program combining vertical farming, ML-driven yield forecasting, and closed-loop nutrient systems — designed to be replicable across urban centers.',
 'https://images.unsplash.com/photo-1780273035805-9c3f782af91a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NjZ8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwZW5naW5lZXJpbmclMjBtb25vY2hyb21lfGVufDB8fHx8MTc4Mjk2MTk4NXww&ixlib=rb-4.1.0&q=85',
 true);

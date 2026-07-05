-- ============================================================================
-- MENTIX-Hub Seed Data
-- Run AFTER schema.sql AND schema_v2.sql have been applied.
-- All passwords: TestPass123!
-- Hash: $2b$12$FhndZKyLs84m7Nyn25RQzeMYtQ8JyRp2jF5kak1PE7aBZhaBJ6OBW
-- ============================================================================

USE mentix_hub;

SET @h = '$2b$12$FhndZKyLs84m7Nyn25RQzeMYtQ8JyRp2jF5kak1PE7aBZhaBJ6OBW';
-- TestPass123!
-- ============================================================================
-- USERS
-- ============================================================================
INSERT INTO users (username, email, password_hash, full_name, bio, year, major, role, status, website, github, twitter, linkedin) VALUES
-- Admin staff
('alex_rivera',   'alex.rivera@mentix.dev',    @h, 'Alex Rivera',         'Platform super administrator.',          NULL, NULL,                   'super_admin', 'active', 'https://alexrivera.dev',     'alex_rivera',   '@alexdev',     'alexrivera'),
('sarah_chen',    'sarah.chen@mentix.dev',     @h, 'Sarah Chen',          'Moderating content and promotions.',     NULL, NULL,                   'moderator',   'active', 'https://sarahchen.codes',   'sarah_chen',    '@sarahmod',    'sarahchen'),
('priya_nair',    'priya.nair@mentix.dev',     @h, 'Priya Nair',          'Backend infrastructure engineer.',       NULL, NULL,                   'dev_admin',   'active', 'https://priya.dev',         'priya_nair',    '@priyacloud',  'priyanair'),

-- Mentors
('dr_rodriguez',  'elena.rodriguez@mentix.dev',@h, 'Dr. Elena Rodriguez', 'Mentoring in AI and machine learning.',  NULL, 'Computer Science',     'mentor',      'active', 'https://elenarodriguez.ai',  'elenarod',      '@drml_elena',  'elenarodriguez'),
('james_wu',      'james.wu@mentix.dev',       @h, 'James Wu',            'Full-stack web development mentor.',     NULL, 'Software Engineering', 'mentor',      'active', 'https://jameswu.dev',        'jameswu',       '@jameswu_dev', 'jameswu'),
('aisha_patel',   'aisha.patel@mentix.dev',    @h, 'Aisha Patel',         'Data science and analytics mentor.',     NULL, 'Data Science',         'mentor',      'active', 'https://aishapatel.io',      'aisha_patel',   '@aishadata',   'aishapatel'),

-- Students
('jordan_kim',    'j.kim@mentix.dev',          @h, 'Jordan Kim',          'Interested in AI and robotics.',         2, 'Computer Engineering',   'student',     'active', 'https://jordankim.tech',     'jordan_kim',    '@jordanbuilds','jordankim'),
('liam_vance',    'liam.vance@mentix.dev',     @h, 'Liam Vance',          'Building fintech side projects.',        3, 'Information Systems',    'student',     'active', 'https://liamvance.finance',  'liam_vance',    '@liamfintech', 'liamvance'),
('ryan_davis',    'r.davis@mentix.dev',        @h, 'Ryan Davis',          'Exploring web and mobile dev.',          1, 'Software Engineering',   'student',     'active', 'https://ryandavis.me',       'ryan_davis',    '@ryancodes',   'ryandavis'),
('marcus_thorne', 'm.thorne@mentix.dev',       @h, 'Marcus Thorne',       'Passionate about open source.',          4, 'Computer Science',       'student',     'active', 'https://marcusthorne.io',    'marcus_thorne', '@marcusoss',   'marcusthorne'),
('mia_santos',    'mia.santos@mentix.dev',     @h, 'Mia Santos',          'UX/UI and frontend focus.',              2, 'Digital Media',          'student',     'active', 'https://miasantos.design',   'mia_santos',    '@miaux',       'miasantos'),
('noah_lee',      'noah.lee@mentix.dev',       @h, 'Noah Lee',            'Cybersecurity enthusiast.',              3, 'Cybersecurity',          'student',     'active', 'https://noahlee.sec',        'noah_lee',      '@noahcyber',   'noahlee'),
('sofia_brown',   'sofia.brown@mentix.dev',    @h, 'Sofia Brown',         'Machine learning and Python.',           2, 'Data Science',           'student',     'active', 'https://sofiabrown.ml',      'sofia_brown',   '@sofiaml',     'sofiabrown'),
('oliver_ng',     'oliver.ng@mentix.dev',      @h, 'Oliver Ng',           'Mobile app development.',                1, 'Mobile Computing',       'student',     'active', 'https://oliverng.app',       'oliver_ng',     '@olivermobile','oliverng'),
('chloe_wilson',  'chloe.wilson@mentix.dev',   @h, 'Chloe Wilson',        'Cloud infrastructure learner.',          4, 'Cloud Computing',        'student',     'active', 'https://chloewilson.cloud',  'chloe_wilson',  '@chloecloud',  'chloewilson'),

-- Edge cases for admin UI testing
('banned_user1',  'banned1@mentix.dev',        @h, 'Banned User',         NULL,                                     1, 'Computer Science',       'student',     'banned',    NULL, NULL, NULL, NULL),
('susp_user1',    'suspended1@mentix.dev',     @h, 'Suspended User',      NULL,                                     2, 'Software Engineering',   'student',     'suspended', NULL, NULL, NULL, NULL);

-- ============================================================================
-- PROJECTS
-- ============================================================================
INSERT INTO projects (title, description, author_id, tags, view_count) VALUES
('De-Fi Security Mesh',   'A decentralized security framework for DeFi protocols using smart contract auditing.', 7,  '["blockchain","security","solidity"]',    412),
('Mental Health Tracker', 'Mobile-first app to track mood, sleep, and activity patterns with ML insights.',       8,  '["mobile","ml","health"]',                289),
('CRISPR Ethics Notes',   'Curated research notes on CRISPR gene editing ethics and policy implications.',        9,  '["bioinformatics","ethics","research"]',   154),
('Quantum Sim Toolkit',   'Python toolkit for simulating quantum circuits on classical hardware.',                 10, '["python","quantum","simulation"]',       321),
('Campus Map 3D',         'Interactive 3D campus map built with Three.js and real building data.',                11, '["threejs","webgl","maps"]',              198),
('Study Buddy AI',        'AI-powered study session planner that adapts to your exam schedule.',                  12, '["ai","education","react"]',              445),
('SecureVault CLI',       'Command-line password manager with AES-256 encryption and TOTP support.',              13, '["cli","security","nodejs"]',             267),
('AR Lab Assistant',      'Augmented reality app that overlays lab instructions on real equipment.',              14, '["ar","ios","swift"]',                    133),
('Cloud Budget Tracker',  'Multi-cloud cost monitoring dashboard with anomaly detection alerts.',                  15, '["cloud","aws","dashboard"]',             378);

-- ============================================================================
-- HEARTS
-- ============================================================================
INSERT IGNORE INTO hearts (user_id, project_id) VALUES
(7,2),(7,3),(7,5),(7,6),
(8,1),(8,4),(8,6),(8,7),
(9,1),(9,2),(9,8),
(10,3),(10,5),(10,9),
(11,1),(11,4),(11,6),(11,7),(11,9),
(12,2),(12,3),(12,5),(12,8),
(13,1),(13,6),(13,9),
(14,2),(14,4),(14,7),
(15,1),(15,3),(15,5),(15,6),(15,8),(15,9),
(4,1),(4,6),(4,9),
(5,2),(5,7),
(6,4),(6,8);

-- ============================================================================
-- COMMENTS
-- ============================================================================
INSERT INTO comments (project_id, user_id, content) VALUES
(1, 8,  'Really solid approach to smart contract auditing. Have you considered formal verification?'),
(1, 9,  'The architecture diagram would help a lot. Any chance you can add one?'),
(1, 4,  'Impressive work for a student project. The threat model is well thought out.'),
(2, 7,  'Love the mood tracking feature. Did you use any pre-trained models or train from scratch?'),
(2, 10, 'This could genuinely help people. Hope you consider open-sourcing it.'),
(3, 11, 'Great resource. Would be even better with a comparison table across jurisdictions.'),
(4, 12, 'Tested this on my laptop — works surprisingly well! What are the gate fidelity numbers?'),
(5, 13, 'The 3D rendering is smooth. What LOD strategy did you use for the building models?'),
(6, 14, 'The adaptive scheduling is the killer feature here. How does it handle exam clashes?'),
(7, 15, 'Clean UX. One suggestion: add a clipboard timeout option for pasted passwords.'),
(8, 7,  'The AR overlay is super accurate. Did you use ARKit or RealityKit?'),
(9, 8,  'Multi-cloud cost tracking in one dashboard is exactly what our team needs.');

-- ============================================================================
-- MENTORSHIP REQUESTS
-- ============================================================================
INSERT INTO mentorship_requests
  (student_id, mentor_id, project_context, project_title, help_needed, previous_efforts, project_stage, guidance_type, status)
VALUES
  ( 7, 4,
   'I am building an AI-powered document summarizer using transformer models.',
   'DocSumm AI',
   'I need help choosing the right pre-trained model and fine-tuning strategy for domain-specific text.',
   'I have tried BART and Pegasus but the summaries lack coherence on legal documents.',
   'prototype',
   'model_selection',
   'pending'),
  ( 8, 5,
   'A mobile-first expense tracking app with real-time budget alerts.',
   'PennyWise',
   'Guidance on implementing offline-first sync with optimistic UI updates.',
   'Built the basic UI in React Native but syncing across devices is unreliable.',
   'development',
   'architecture',
   'accepted'),
  ( 9, 6,
   'Analyzing student dropout patterns using institutional survey data.',
   'EduRetain',
   'Which clustering approach works best for mixed categorical and numerical features?',
   'Ran K-Means but the silhouette score is low; categorical encoding might be the issue.',
   'analysis',
   'algorithm_advice',
   'pending'),
  (11, 6,
   'A dashboard that visualizes real-time user engagement metrics.',
   'UX Pulse',
   'Best practices for designing accessible data visualizations for colour-blind users.',
   'I have a working prototype with Chart.js but got feedback about colour accessibility.',
   'prototype',
   'design_review',
   'rejected'),
  (13, 4,
   'A Python package that automates ML pipeline hyperparameter tuning with optional GPU support.',
   'TuneOps',
   'How to structure the plugin system so users can add custom search strategies?',
   'Looked at Optuna and Hyperopt source code but unsure about the extension API design.',
   'ideation',
   'architecture',
   'pending');

-- ============================================================================
-- COLLABORATION REQUESTS
-- ============================================================================
INSERT INTO collaboration_requests
  (sender_id, receiver_id, intro, project_interest, own_project_name, own_project_desc, why_needed, skills, other_skill, preferred_connect, status)
VALUES
  (10,  5,
   'Hey James, I loved your full-stack work on the campus map project.',
   'Campus Map 3D',
   'OpenStreetView',
   'A community-driven street-level imagery platform for university campuses.',
   'Your WebGL expertise would be invaluable for the panorama rendering engine.',
   'React, Node.js, PostgreSQL',
   'Three.js basics',
   'Discord',
   'pending'),
  (12,  6,
   'Hi Aisha, I saw your data science projects and think we could build something great together.',
   'Study Buddy AI',
   'CyberSafe Schools',
   'A cybersecurity awareness platform that uses ML to detect phishing simulations.',
   'Your analytics background would help me build the detection models and visualise risk trends.',
   'Python, Flask, MySQL',
   'scikit-learn basics',
   'Email',
   'accepted'),
  (14,  4,
   'Dr. Rodriguez, I am developing an AR lab assistant and would love your mentorship.',
   'AR Lab Assistant',
   'BioAR',
   'An augmented reality layer that overlays biological specimen annotations in real time.',
   'I need someone with ML expertise to help with real-time object recognition in video frames.',
   'Swift, ARKit, CoreML',
   'Python, OpenCV',
   'Slack',
   'pending'),
  ( 9,  5,
   'James, I am looking for a collaborator to build the backend of a research paper sharing platform.',
   'CRISPR Ethics Notes',
   'PaperHub',
   'A platform where students can share, annotate, and discuss research papers.',
   'Your full-stack experience would be great for designing the real-time collaboration features.',
   'React, Firebase',
   'Node.js basics',
   'Discord',
   'rejected'),
  (15,  4,
   'Dr. Rodriguez, I am working on a cloud cost anomaly detection tool and need AI guidance.',
   'Cloud Budget Tracker',
   'CloudWatchAI',
   'An intelligent agent that predicts cloud spending spikes before they happen.',
   'Your ML mentorship would help me choose between LSTM and Transformer for time-series forecasting.',
   'AWS, Python, Terraform',
   'TensorFlow basics',
   'Email',
   'pending');

-- ============================================================================
-- REPORTS
-- ============================================================================
INSERT INTO reports (project_id, reported_by, reason, description, status, priority) VALUES
(1, 11, 'Spam content',           'User repeatedly posted promotional links in project comments.',               'pending',      'high'),
(2, 12, 'Plagiarism',             'Project description copied near-verbatim from a published research paper.',  'under_review', 'medium'),
(3, 13, 'Inappropriate language', 'Comment thread contained language violating community guidelines.',           'resolved',     'low'),
(4, 14, 'Misleading title',       'Title claims quantum hardware support but only runs on classical CPUs.',      'pending',      'low'),
(5, 15, 'Copyright violation',    'Map tiles appear to be from Google Maps without attribution.',               'under_review', 'high');

-- ============================================================================
-- PROMOTION QUEUE
-- ============================================================================
INSERT INTO promotion_queue (user_id, status, requirements_met) VALUES
(7,  'pending', '{"min_projects":{"required":3,"actual":4,"met":true},"min_hearts":{"required":10,"actual":14,"met":true},"min_account_age_days":{"required":30,"actual":41,"met":true},"min_comments":{"required":5,"actual":6,"met":true}}'),
(10, 'pending', '{"min_projects":{"required":3,"actual":2,"met":false},"min_hearts":{"required":10,"actual":11,"met":true},"min_account_age_days":{"required":30,"actual":52,"met":true},"min_comments":{"required":5,"actual":5,"met":true}}');

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================
INSERT INTO audit_logs (admin_id, admin_role, action_type, target_type, target_id, method, ip_address) VALUES
(2, 'moderator',   'user_suspended',     'user',            16, 'PUT',    '192.168.1.10'),
(1, 'super_admin', 'change_user_role',   'user',             4, 'PUT',    '192.168.1.1'),
(2, 'moderator',   'promotion_approved', 'promotion_queue',  1, 'PUT',    '192.168.1.10'),
(1, 'super_admin', 'promotion_rejected', 'promotion_queue',  2, 'PUT',    '192.168.1.1');

-- ============================================================================
-- BACKUP HISTORY
-- ============================================================================
INSERT INTO backup_history (backup_type, size_bytes, status, file_path, initiated_by, duration_seconds) VALUES
('scheduled', 883458048, 'success', '/backups/mentix_hub_backup_2024-10-27T00-00-00.sql', 3, 42),
('manual',    871833600, 'success', '/backups/mentix_hub_backup_2024-10-26T14-30-00.sql', 1, 38),
('scheduled', 0,         'failed',   NULL,                                                 3, NULL);

-- ============================================================================
SELECT CONCAT('Users    : ', COUNT(*)) AS seeded FROM users;
SELECT CONCAT('Projects : ', COUNT(*)) AS seeded FROM projects;
SELECT CONCAT('Reports  : ', COUNT(*)) AS seeded FROM reports;

# 🏛️ Alchemist Academy CMS & School Platform
## Official Project Handover & Technical Administration Manual

**Document Version:** 1.0.0  
**Target Client / Deployment:** Alchemist Academy Secondary School, Jorpati, Kathmandu  
**Live Production Domain:** [https://alchemistacademy.edu.np](https://alchemistacademy.edu.np)  
**Codebase Repository:** [GitHub Repository](https://github.com/Rishikesh-1/Alchemist-Academy-Secondary-School)  
**Branch:** `main`

---

## 1. Executive Summary & Architecture Overview

This project is a high-performance, white-label school web platform and administrative content management system (CMS). It was engineered as **Phase 1** of a larger multi-tenant School ERP (SaaS) architecture designed for commercial deployment across schools and colleges in Nepal.

### System Architecture Highlights:
* **Frontend Application:** React 19 single-page application bundled with Vite and styled using Tailwind CSS v4. Supports site-wide dark/light themes, clean root URLs, and dynamic SEO document headers.
* **Backend REST API:** Lightweight, production-grade PHP 8+ API endpoints hosted on cPanel LiteSpeed web server.
* **Database Layer:** cPanel MySQL database structured with multi-tenant `school_id` fields for future SaaS tenancy scaling.
* **Storage Layer:** Server-side file upload system saving validated, compressed media directly to `/public_html/uploads/{school_id}/` (completely replacing browser Base64 storage).

```
   +-----------------------------------------------------------------------+
   |                        PUBLIC VISITORS & CLIENTS                      |
   |              https://alchemistacademy.edu.np (Clean URLs)              |
   +-----------------------------------------------------------------------+
                                      |
                                      v
   +-----------------------------------------------------------------------+
   |                   REACT 19 SPA (Vite + Tailwind CSS v4)                |
   |  - Public Portal: Hero, Stats, About, Leadership, Curriculum, Blogs   |
   |  - Visual Customizer: Live site preview with Dark/Light toggle        |
   |  - Central Media Library with Universal Picker                        |
   +-----------------------------------------------------------------------+
                    |                                    ^
                    | HTTP POST (JSON / Multipart)       | HTTP GET (JSON)
                    v                                    |
   +-----------------------------------------------------------------------+
   |                        REST API LAYER (/api/)                         |
   |  - site-settings.php (Cloud Sync)     - upload.php (Media Processing)  |
   |  - admissions.php (Lead Inquiries)    - media.php (Asset Catalog)      |
   +-----------------------------------------------------------------------+
                    |                                    |
                    v                                    v
   +--------------------------------+   +----------------------------------+
   |     cPanel MySQL Database      |   |        Local File Storage        |
   |   `site_settings` (JSON State) |   |    `/uploads/{school_id}/`       |
   |   `users`, `admissions`, etc.  |   |    (JPEG, PNG, WebP, SVG, PDF)   |
   +--------------------------------+   +----------------------------------+
```

---

## 2. Server & Deployment Specifications

| Resource | Value / Path |
| :--- | :--- |
| **Hosting Provider** | Standard cPanel / LiteSpeed Web Server |
| **Server Host / IP** | `<CPANEL_SERVER_IP>` (SSH Port: `22`) |
| **cPanel User** | `<CPANEL_USER>` |
| **Web Root (DocumentRoot)** | `/home/<CPANEL_USER>/<DOMAIN_ROOT>` |
| **Database Server** | MySQL 8.x / MariaDB |
| **Database Name** | `<CPANEL_DATABASE_NAME>` |
| **Database User** | `<CPANEL_DATABASE_USER>` |
| **API Directory** | `/home/<CPANEL_USER>/<DOMAIN_ROOT>/api/` |
| **Uploads Directory** | `/home/<CPANEL_USER>/<DOMAIN_ROOT>/uploads/` |
| **Backup Archive Directory** | `/home/<CPANEL_USER>/wordpress-backups/` |

> [!NOTE]
> **Server Access Details:**
> Exact production IP addresses, database credentials, and server keys are maintained strictly in your private local infrastructure file (`CONFIDENTIAL_INFRASTRUCTURE.local.md`) and are never exposed in public repositories.

---

## 3. Portals & Access Credentials

### Public Website
* **URL:** `https://alchemistacademy.edu.np`
* **Features:** Responsive hero showcase, curriculum pathways (3 on homepage + dedicated page), co-curricular activities (3 on homepage + dedicated page), blogs/announcements (3 on homepage + modal reader + dedicated page), and express admission lead submission.

### Administrative CMS Dashboard
* **Access URL:** `https://alchemistacademy.edu.np/#/admin/dashboard`
* **Login Gateway:** `https://alchemistacademy.edu.np/#/admin/login` (or append `?portal=admin`)

### Default Staff Accounts (RBAC)

| Account Role | Username | Initial Password | Permitted Modules |
| :--- | :--- | :--- | :--- |
| **Super Administrator** | `admin` | `[Configured in Private Setup]` | Full unconstrained access to all 12 CMS sections, Media Library, and User Account Maintenance. |
| **Content Editor** | `editor` | `[Configured in Private Setup]` | Blog Articles, Curriculum Subjects, Co-Curricular Programs, and Media Library. |
| **Admissions Officer** | `admissions` | `[Configured in Private Setup]` | Admissions Hotlines, Lead Counters, Statistics Grid, and Media Library. |
| **Academic Coordinator** | `coordinator` | `[Configured in Private Setup]` | Curriculum Pathways, About Details, Co-Curricular Programs, Leadership Quotes, and Media Library. |

*Passwords can be changed at any time by the Superadmin inside the **Staff & Team Access** module in the CMS Dashboard.*

---

## 4. CMS Modules Reference & User Guide

The visual CMS controls 12 distinct website sections. All changes save live to the cPanel MySQL database via the **"Save & Apply"** button and propagate across all desktop, tablet, and mobile browsers:

1. **Branding & Logo:** Configure school display name, tagline, logo mode (uploaded custom PNG/SVG image or vector crest icon), brand accent color, and browser tab Favicon.
2. **Hero Banner & BG:** Change hero background image, dark overlay tint slider (10% to 95%), main headlines, CTA button labels, and the **3 bottom banner highlight badges** (with selectable icons).
3. **About School:** Edit the introductory narrative, campus photo, location badge, grade level pill, and the **4 core pillar checkmark lines** (with add/delete options).
4. **Stats Grid:** Modify the 4 key school performance counters (*e.g., "400+ Enrollments", "10+ Years Excellence"*).
5. **Leadership Messages:** Manage executive messages from the Headmaster / Principal, Vice Principal, and Academic Director, with targeting toggles for Home page vs. About page display.
6. **Curriculum Pathways:** Add, modify, or reorder academic streams (Computer Science, Science, Fine Arts, Music, etc.) with custom covers, badges, and descriptions.
7. **Co-curricular Activities:** Add new clubs/activities, set category tags (*e.g., Physical Health, Literary & Media*), upload banner images, and edit individual **bullet points / highlights**.
8. **Blog & News Articles:** Full article publisher with title, category, author, read time, summary, banner image, and full markdown-compatible content.
9. **Admissions CTA & Hotline:** Configure inquiry hotline phone numbers, email addresses, and admission deadline banners.
10. **Footer & Address:** Campus street address, contact emails, working hours, and social media handles (Facebook, Instagram, YouTube, X).
11. **Media Library:** Central cloud asset manager to upload, categorize, rename, preview, search, and delete campus images.
12. **Staff & Team Access (Superadmin Only):** Add new team accounts, change passwords, update roles, or suspend/revoke accounts.

---

## 5. Developer Guide & Operations

### Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/Rishikesh-1/Alchemist-Academy-Secondary-School.git
cd Alchemist-Academy-Secondary-School

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
# Vite runs at http://localhost:5173

# 4. Or run via local XAMPP Apache
# Point Apache to c:\xampp\htdocs\Alchemist Academy
# URL: http://localhost/Alchemist%20Academy/
```

### Building for Production & Deploying to cPanel

```bash
# 1. Compile production assets
npm run build

# 2. Deploy index.html to cPanel root
scp -i ~/.ssh/<YOUR_SSH_KEY> dist/index.html <USER>@<HOST>:/home/<USER>/<DOMAIN_ROOT>/index.html

# 3. Deploy hashed CSS/JS/images to cPanel assets directory
scp -i ~/.ssh/<YOUR_SSH_KEY> dist/assets/* <USER>@<HOST>:/home/<USER>/<DOMAIN_ROOT>/assets/
```

### Backend Database Schema Reference (`api/schema.sql`)

* `schools`: Master tenant registry (`id`, `name`, `slug`, `domain`, `status`, `subscription_plan`).
* `users`: Staff authentication & role access (`id`, `school_id`, `username`, `password_hash`, `role`, `status`).
* `site_settings`: JSON serialized configuration storing all 12 CMS modules per `school_id`.
* `media_library`: Catalog of uploaded assets (`file_name`, `file_url`, `file_size`, `mime_type`, `category`, `alt_text`).
* `admission_inquiries`: Student lead inquiries submitted via the public website (`parent_name`, `phone`, `email`, `grade_applying`, `status`, `notes`).

---

## 6. Next Phase Roadmap: Multi-Tenant School ERP (SaaS)

With Phase 1 complete and fully deployed, the system is primed for **Phase 2 Expansion**:

* **Workspace Switcher:** Sidebar toggle between `🌐 Website CMS`, `🏫 Academic ERP`, and `💰 Finance & HR`.
* **Admissions Kanban Pipeline:** Move admission leads from *New* $\to$ *Follow-Up* $\to$ *Campus Tour* $\to$ *Entrance Test* $\to$ *Enrolled*.
* **Student & Staff Information System (SIS):** Student directory, class/section assignments (Nursery – Grade 10), and automated ID card generation with QR codes.
* **Attendance Engine:** Daily attendance tracking with Bikram Sambat (BS / Nepali Patro) calendar support.
* **Nepal CDC / NEB Grading Engine:** Automated GPA calculations, letter grading (`A+`, `A`, `B+`, etc.), and one-click printable PDF Progress Cards.
* **Finance & Fee Billing:** Tuition fee tiers (Baisakh–Chaitra), bus transport tiers, online payment receipts (eSewa / Khalti), and due fee alerts via SMS.
* **Mobile App Ready:** Standardized JWT token authentication for the future unified Flutter mobile application.


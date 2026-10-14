# Alchemist Academy Secondary School

A modern, responsive, high-performance web platform and Role-Based CMS for **Alchemist Academy Secondary School** located in Kathmandu, Nepal.

Built with **React**, **Vite**, and **Tailwind CSS v4**, featuring comprehensive security hardening, SEO structured data, and an administrative dashboard with granular Role-Based Access Control (RBAC).

---

## 🌟 Key Features

### 1. Public School Experience
- **Hero & Campus Showcase**: Responsive hero section featuring school events and cultural programs.
- **Academic Narrative**: Highlights the journey from Nursery through Grade 10 with values-driven holistic education.
- **Dynamic Stats Grid**: Key performance metrics (100% SEE pass rate, 25:1 student-faculty ratio, STEM labs, fine arts studios).
- **Headmaster's Vision**: Message from Karmendra Vimal on transformative education.
- **6 Curriculum Pathways**: Dedicated modules for Computer Science, Natural Sciences, Fine Arts, Music, Performing Arts, and Competitive Athletics.
- **Co-Curricular Life**: Athletic programs, school publications, and creative arts clubs.
- **Interactive Blog & Articles**: Reader modal with reading times, tags, and rich content.
- **Admissions Inquiry Form**: Secure form with input sanitization, CSRF protection token, and rate limiting.

### 2. Security Hardening & Architecture
- **Hidden Admin Route**: Public navigation header remains clean without exposed administrative links.
- **Role-Based Access Control (RBAC)**: Multi-tier access control separating administrative tasks.
- **Security Headers (`.htaccess`)**:
  - `Content-Security-Policy`
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **Session Management**: Session tokens stored in `sessionStorage` with an automatic 2-hour inactivity expiration.
- **Form Sanitization**: XSS mitigation and phone/email format validation.

### 3. Superadmin User Management & Team Maintenance
The Super Administrator has full control to:
- **Provision New Staff**: Create new team accounts with designated username, password, department, and role tier.
- **Maintain & Edit Accounts**: Update staff names, departments, passwords, and assigned roles on the fly.
- **Account Status Control**: Temporarily suspend or reactivate staff accounts without deleting them.
- **Revoke / Delete Accounts**: Safely delete staff accounts (with root account protection).

### 4. Role Hierarchy

| Role Tier | Display Title | Permitted Modules |
| :--- | :--- | :--- |
| `superadmin` | **Super Administrator** | All 11 CMS sections + User Management & Staff Provisioning |
| `editor` | **Content Editor** | Blog Articles, Curriculum Pathways, Co-Curricular Programs |
| `admissions` | **Admissions Officer** | Admissions Hotlines, CTAs, Student Statistics Counters |
| `academic` | **Academic Coordinator** | Curriculum Pathways, About Details, Co-Curricular, Headmaster's Note |

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Typography**: Playfair Display (Serif Brand) + Inter (Sans)
- **Deployment Targets**: Apache / XAMPP, Vercel, Netlify, or GitHub Pages

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Rishikesh-1/Alchemist-Academy-Secondary-School.git
cd Alchemist-Academy-Secondary-School

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```bash
# Build production bundle
npm run build

# Preview build locally
npm run preview
```

### Running in XAMPP / Apache
Place the repository inside your Apache web root (e.g., `c:\xampp\htdocs\Alchemist Academy`).
- `index.php` automatically redirects visitors to the optimized production build in `dist/`.
- Access via `http://localhost/Alchemist%20Academy/`

---

## 🔒 Default Staff Credentials (Demo / Testing)

| Username | Default Password | Role |
| :--- | :--- | :--- |
| `admin` | `AlchemistAdmin2026` | Super Administrator |
| `editor` | `EditorPass2026` | Content Editor |
| `admissions` | `AdmissionsPass2026` | Admissions Officer |
| `coordinator` | `AcademicPass2026` | Academic Coordinator |

> **Note**: Default passwords can be changed and updated by the Super Administrator at any time inside the **Staff & Team Access** tab.

---

## 📈 SEO & Performance
- Semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
- Validated `EducationalOrganization` / `School` schema in JSON-LD.
- OpenGraph and Twitter card meta tags for rich social sharing.
- Compressed WebP assets for optimal Core Web Vitals.


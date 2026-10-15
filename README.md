# Alchemist Academy - School & College Management System (SMS) & CMS

An enterprise, multi-tenant School & College Management System and Visual CMS built for **Alchemist Academy Secondary School & College** (Kathmandu, Nepal).

Featuring strict Role-Based Access Control (RBAC), multi-branch campus isolation, server-side Bcrypt password security, brute-force rate limiting, dual AD ⇄ BS Bikram Sambat calendar engine, official Nepal CDC / NEB grading scale, and immutable audit logging.

---

## 🏛️ System Architecture & Features

### 1. Multi-Tenant & Multi-Branch Architecture
- **Tenant Isolation**: Designed for separated institutional colleges/schools with dedicated branch namespaces (`schools` and `branches`).
- **Campus Selector**: Switch between branches (e.g. *Main Campus* vs *Bouddha Secondary Wing*) with automatic data scoping.

### 2. Role-Based Access Control (RBAC) - 7 Authorized Roles
Fine-grained clearance enforced across both backend API guards and frontend dashboards:

| Role | Title | Clearance Scope | Seed Account |
| :--- | :--- | :--- | :--- |
| **`admin`** | School Administrator | Full authority over branches, staff roles, admissions, student records, fee billing, timetable, and audit logs | `admin` / `Admin@2026` |
| **`principal`** | Principal / Headmaster | Academic oversight, curriculum regulation, faculty management, attendance audits, CDC grading approvals, and TC endorsements | `principal` / `Principal@2026` |
| **`teacher`** | Faculty Teacher | Daily and period class roll-call, timetable inspection, student mark entry, and report card evaluations | `teacher` / `Teacher@2026` |
| **`accountant`** | Senior Bursar & Cashier | Counter tuition collection, fee structures, installment schedules, receipt issuance, and 30/60/90+ day defaulter reports | `accountant` / `Accountant@2026` |
| **`librarian`** | Librarian | Book cataloging, circulation issues/returns, student card validations, and fine collection | `librarian` / `Librarian@2026` |
| **`parent`** | Guardian / Parent | Ward attendance records, digital report cards, tuition fee dues, and absence alerts | `parent` / `Parent@2026` |
| **`student`** | Student | Personal profile, class timetable, homework/syllabus, CDC grade sheets, digital ID card, and library borrowings | `student` / `Student@2026` |
| **`superadmin`** | Platform Director | Full unconstrained platform authority and SaaS console management | `superadmin` / `Admin@2026` |

### 3. Secure Authentication & Rate Limiting
- **Bcrypt Hashing**: Passwords stored as irreversible salted Bcrypt hashes (`PASSWORD_BCRYPT`). Legacy plaintext passwords are automatically and transparently upgraded to Bcrypt on next login.
- **Brute-Force Rate Limiting**: Max 5 failed attempts per 15-minute window tracked per IP/username in `login_attempts`. Locked automatically upon threshold breach.
- **Cryptographic Tokens**: Signed HMAC-SHA256 session bearer tokens with 7-day expiration and tamper verification.
- *(Note: 2FA is deliberately deferred for pre-deployment phase as instructed).*

### 4. Student Profiles (SIS), Bulk CSV Import, Promotions & TC
- **Student Dossier**: Photo, roll number, admission number, guardian contact details, and uploaded documents.
- **Bulk Import from Excel/CSV**: Ingest hundreds of student profiles in a single transactional import with validation.
- **Academic Promotion Engine**: Move cohorts from one academic year/grade to the next with historical tracking in `student_promotions`.
- **Transfer Certificates (TC)**: Issue official printable TCs with unique `tc_number` and cryptographically verifiable security tokens.

### 5. Daily & Per-Period Attendance with Parent Absence Alerts
- **Dual Mode**: Support both **Daily Roll-call** and **Per-Period Marking** (Periods 1 to 8).
- **Bulk Class Marking**: Fast bulk toggles (*Present, Absent, Late, Excused*).
- **Automated Absence Alerts**: Instant dispatch of absence notifications to parents of absent students via SMS/In-App.

### 6. Fees, Installments, Receipts & Defaulters Aging
- **Billing Tariffs & Installments**: Monthly, quarterly, and annual installment tariff configuration with due days and late penalty policies.
- **Cashier Terminal**: Counter cash, cheque, and QR payment collection with real-time receipt generation (`REC-YYYY-XXXXXX`).
- **Defaulters Aging Report**: Categorized into 4 aging buckets:
  - Under 30 Days (Grace Period)
  - 30 to 60 Days (Late Fee Active)
  - 60 to 90 Days (Warning Phase)
  - Over 90 Days (Critical Recovery)
- **Due Reminders Dispatcher**: One-click broadcast of SMS fee due notices to parents of defaulters.

### 7. Timetable with Automated Clash Detection & CDC Grading
- **Collision Prevention**: Database unique constraints and pre-flight validation prevent:
  - Faculty collision: Teacher assigned to two classes simultaneously.
  - Room collision: Room booked by two classes at the same period.
- **Nepal CDC / NEB Grading Engine**:
  - Theory Marks (75) + Practical Marks (25) = Total (100).
  - CDC Letter Grade (*A+, A, B+, B, C+, C, D, NG*), Grade Point (*0.0 to 4.0*), and GPA calculation.
- **Official Terminal Grade Sheet**: Printable report cards with attendance summaries, CDC grades, and principal stamp blocks.

### 8. Admissions Pipeline & Merit Lists
- Online inquiry pipeline with status workflow (*New, Under Review, Campus Visit, Enrolled*).
- Entrance exam scoring and automated **Merit List Ranking** with cut-off score publishing.

### 9. Operations: Library, Transport & Staff Payroll
- **Library Catalog**: ISBN tracking, real-time available copy counters, book issue loans, return processing, and overdue fine engine.
- **Transport Fleet**: Vehicle registry with driver phone contacts, transit routes, and student stop pickup schedules.
- **Staff Payroll**: Salary structures, allowances (dearness, medical), deductions (provident fund EPF, CIT, income tax), and monthly payslip generation.

### 10. Dual Calendar (AD ⇄ BS) & Bilingual English / Nepali
- **Dual Date Display**: Real-time conversion between Gregorian (AD) and Bikram Sambat (BS) with Devanagari numerals.
- **Language Switcher**: Toggle between English and Nepali (`EN / नेपाली`) across all navigation items, tables, forms, and alerts.

### 11. Immutable Audit Logging
- Every update to student marks, fee collections, student registrations, promotions, and TC issuances is logged immutably in `audit_logs` with timestamps, staff user ID, IP address, and JSON diffs of before/after snapshots.

---

## 📁 Modular Codebase Organization

```
Alchemist Academy/
├── api/                               # PHP Backend API layer
│   ├── config/
│   │   ├── db.php                     # Smart DB connector (XAMPP local & cPanel fallback)
│   │   ├── auth_guard.php             # JWT/HMAC token verifier & RBAC middleware
│   │   └── cors.php                   # CORS & JSON response helpers
│   ├── auth/
│   │   ├── login.php                  # Rate limiting, Bcrypt auth & HMAC token issuer
│   │   └── me.php                     # Authenticated user dossier
│   ├── migrations/
│   │   ├── migrate.php                # Safe idempotent database migration runner
│   │   ├── seed.php                   # Database seeder with Bcrypt test accounts
│   │   ├── 001_multi_tenant_branches_roles.sql
│   │   ├── 002_academic_students_attendance.sql
│   │   ├── 003_fees_billing_finance.sql
│   │   ├── 004_timetable_exams_grading.sql
│   │   ├── 005_library_transport_payroll.sql
│   │   └── 006_admissions_merit_list.sql
│   ├── students/                      # Student SIS, Bulk CSV, Promotions & TC
│   ├── attendance/                    # Daily & period attendance + absence alerts
│   ├── fees/                          # Structures, cashier collection & defaulters
│   ├── timetable/                     # Clash-free period scheduler
│   ├── exams/                         # CDC marks & report card generator
│   ├── admissions/                    # Applications & merit list ranking
│   ├── operations/                    # Library, transport fleet & staff payroll
│   ├── notifications/                 # Multi-channel notification dispatcher
│   └── audit/                         # Immutable audit logs endpoint
│
├── src/                               # React 19 Frontend
│   ├── components/
│   │   ├── SchoolManagementDashboard.jsx  # Main SMS Dashboard container
│   │   ├── CashierFeeCollector.jsx        # Counter billing terminal
│   │   ├── Dashboard.jsx                  # Visual Website CMS
│   │   ├── dashboard/tabs/
│   │   │   ├── BranchSwitcher.jsx         # Multi-branch selector pill
│   │   │   ├── LanguageToggle.jsx         # EN ⇄ NE language switcher
│   │   │   ├── SisTab.jsx                 # Student SIS, Bulk CSV, Promotions & TC
│   │   │   ├── AttendanceTimetableTab.jsx # Daily/Period attendance & clash check
│   │   │   ├── CashierFeesTab.jsx         # Defaulters aging & fee tariffs
│   │   │   ├── CdcGradingTab.jsx          # CDC mark entry & printable grade sheets
│   │   │   ├── AdmissionsMeritTab.jsx     # Applicant pipeline & merit lists
│   │   │   ├── OperationsTab.jsx          # Library, transport transit & payroll
│   │   │   └── AuditTrailTab.jsx          # Immutable audit trail inspector
│   │   └── portal/
│   │       ├── SMSLoginScreen.jsx         # SMS login screen with 7-role test buttons
│   │       └── DigitalStudentIDModal.jsx  # Printable student ID card with QR
│   ├── context/
│   │   ├── AuthContext.jsx                # Multi-tenant auth, 7 roles, branch & lang
│   │   └── SiteContext.jsx                # Public CMS site data
│   ├── services/
│   │   └── api.js                         # Enterprise API client with Bearer auth
│   └── utils/
│       ├── nepaliCalendar.js              # AD <-> BS Bikram Sambat dual converter
│       └── translations.js                # English & Nepali UI dictionary
```

---

## 🛠️ Database Setup & Migrations

### Run Database Migrations
Migrations are fully non-destructive and idempotent. Run anytime via CLI:
```bash
php api/migrations/migrate.php
```

### Seed Test Data
Populates institutions, branches, classes, subjects, clash-free timetables, fee invoices, books, transport routes, and active Bcrypt accounts for all 7 roles:
```bash
php api/migrations/seed.php
```

---

## 🔑 Test Credentials (Out of the Box)

| Role | Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `Admin@2026` | Full institutional administrator |
| **Principal** | `principal` | `Principal@2026` | Academic oversight & TC endorsements |
| **Teacher** | `teacher` | `Teacher@2026` | Attendance, marks & timetable |
| **Accountant** | `accountant` | `Accountant@2026` | Cashier, fees & defaulters |
| **Librarian** | `librarian` | `Librarian@2026` | Library catalog & book loans |
| **Parent** | `parent` | `Parent@2026` | Ward attendance, report card & dues |
| **Student** | `student` | `Student@2026` | ID card, grades, syllabus & timetable |

---

## 💻 Development & Production Build

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Compile production bundle
npm run build
```
In XAMPP, open `http://localhost/Alchemist%20Academy/` to access the application.

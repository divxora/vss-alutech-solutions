# VSS Alutech Solutions - React Application

A modern, responsive, and high-performance React (Vite + TypeScript) B2B industrial website for **VSS Alutech Solutions**, an engineering solutions partner specializing in aluminium extrusion plant setup, machinery consultancy, billet heating and ageing furnaces, plant maintenance, precision die sourcing, and industrial technical manpower supply.

---

## 🏭 Architecture & Modern React Port

This project was rewritten into a React application on Vite + TypeScript, preserving all original features, business logic, visual styling, photography, and interactive widgets:

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Modular CSS architecture adhering to the original industrial aesthetic (Deep Navy `#0A192F`, Crisp White, Industrial Orange `#FF6B00`).
- **Interactive State & Features:**
  - **Header & Navigation:** Sticky scroll detection, active section observation via `IntersectionObserver`, and mobile drawer navigation with backdrop click and Escape key dismissal.
  - **Aluminium Alloy Grades We Support:** Comprehensive metallurgical section showcasing standard series (1xxx, 2xxx, 3xxx, 4xxx, 5xxx, 6xxx, 7xxx) and a dedicated panel for 20 Additional Legacy Designations without chemical tables. Includes interactive series filtering and one-click quotation prefilling.
  - **Authentic Factory Photography:** Real industrial plant photographs installed across all hero, furnace, extrusion press, tooling, and billet warehouse slots.
  - **Press Capacity Sizing Estimator:** Real-time engineering rule-of-thumb benchmark with billet diameter selection (4" to 12") and alloy groups (6063, 6061, 7075/hard), with direct parameter transfer to the consultation form.
  - **Manpower Interactive Filter Tabs:** Filterable roles across Senior Management, Supervisory/Technical, Machine Operators, and Support Staff.
  - **Dedicated Manpower Requisition Form:** Form validation for worker count, designation, skill level, shift, contract duration, and location with localStorage persistence.
  - **Consultation & Quote Form:** Form validation, drawing attachment handler (with live file size calculation in MB), localStorage persistence, and confirmation alerts.
  - **Modals:** Solutions Brochure Download modal (with simulated download), Privacy Policy modal, and Terms & Conditions modal.
  - **Interactive FAQ Accordion:** Clean animated accordion toggle for common technical queries.
  - **Toast Notifications:** Self-dismissing toast alerts for interactive actions.
  - **Back to Top:** Floating smooth-scroll button.

---

## 🗂 Project Structure

```
├── index.html                 # HTML5 entry point with OpenGraph, SEO meta tags, and fonts
├── package.json               # React 19 + TypeScript + Vite dependencies
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite server and bundler config
├── metadata.json              # Application identity metadata
├── README.md                  # Project documentation
├── public/
│   └── assets/images/         # Industrial photography and assets
└── src/
    ├── main.tsx               # React root entry point
    ├── App.tsx                # Main App component coordinating state and sections
    ├── types.ts               # Data models and form interfaces
    ├── index.css              # Industrial B2B CSS styling and variables
    └── components/
        ├── Header.tsx         # Top utility bar, main nav, mobile drawer
        ├── Hero.tsx           # Full-width hero banner with service highlights
        ├── ServiceOverview.tsx# 6 Image service cards
        ├── StatsPanel.tsx     # Capabilities and key statistics
        ├── PressSolutions.tsx # Service 1 & Interactive Tonnage Estimator
        ├── FurnaceSolutions.tsx # Service 2: Thermal engineering & ovens
        ├── Troubleshooting.tsx# Service 3: Plant maintenance & defect rectification
        ├── ToolRoomDies.tsx   # Service 4: 4-step transparent die sourcing workflow
        ├── ManpowerSupplier.tsx# Service 5: Role filter tabs & staffing form
        ├── ProcessRoadmap.tsx # 7-stage project lifecycle roadmap
        ├── IndustriesServed.tsx# 6 application sector cards
        ├── FeaturedProjects.tsx# 4 illustrative project benchmarks
        ├── FaqSection.tsx     # Expandable accordion FAQs
        ├── ConsultationSection.tsx # Consultation quote form with file attachment
        ├── Footer.tsx         # Footer with dynamic year and contact details
        ├── Modals.tsx         # Brochure, Privacy, and Terms dialogs
        ├── Toast.tsx          # Real-time toast feedback
        └── BackToTop.tsx      # Floating back to top button
├── server/
│   ├── app.ts                 # Express application with security, CORS, and parsers
│   ├── standalone.ts          # Dedicated standalone backend runner
│   ├── config/                # SQLite database and Nodemailer transporter
│   ├── controllers/           # Contact, Manpower, Quote, and Admin controllers
│   ├── middleware/            # Auth (JWT), Upload (Multer), RateLimiter, Validator
│   ├── models/                # SQLite submission and admin user models
│   └── routes/                # API routes: contact, manpower, quote, and admin
├── server.ts                  # Root full-stack entry point (Express API + Vite Dev / Static Bundle)
└── BACKEND.md                 # Detailed backend documentation and API reference
```

---

## ⚡ Backend API & Features

The platform includes a complete, production-ready **Node.js, Express, and SQLite** backend:

- **Form Submissions:**
  - `POST /api/contact` — Handles general business enquiries and technical consultations.
  - `POST /api/manpower-request` — Structured industrial staffing requisitions (designation, worker count, shift, skill level).
  - `POST /api/quote-request` — Detailed machinery quotes with multipart CAD / blueprint file uploads (`multer`).
- **Input Validation & Security:** Sanitized inputs with `express-validator`, protected by `helmet`, `cors`, and `express-rate-limit`.
- **Nodemailer Automated Email Notifications:**
  - Instant admin dispatch to `info@vsslutechsolutions.in`.
  - Auto-acknowledgement receipt to clients with generated tracking reference ID.
- **Admin Authentication & Dashboard Portal:**
  - `POST /api/admin/login` — Secure admin login using JWT and `bcryptjs`.
  - `GET /api/admin/submissions` — Protected view of all form enquiries, manpower requests, and quotes with filtering, search, and pagination.
  - `DELETE /api/admin/submissions/:id` — Protected route to delete or archive processed inquiries.
  - `GET /api/admin/download/:id` — Protected CAD/blueprint file download.

---

## 🚀 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Run full-stack development server (Express API + Vite frontend on port 3000)
npm run dev

# 3. Or run standalone backend only (port 5000)
npm run server

# 4. Production build
npm run build

# 5. Start production server
npm start
```

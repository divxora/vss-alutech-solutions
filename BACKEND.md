# VSS Alutech Solutions — Backend Architecture & API Documentation

Production-grade, modular Node.js + Express + SQLite backend for **VSS Alutech Solutions**, engineering solutions partner for aluminium extrusion operations across India.

---

## 1. Architecture & Directory Structure

The backend follows an enterprise layered architecture with complete separation of concerns:

```
├── server.ts                       # Root full-stack entry point (Express API + Vite Dev / Static Bundle)
├── server/
│   ├── app.ts                      # Express application setup, security middleware, and route mounting
│   ├── standalone.ts               # Dedicated standalone backend server runner (PORT 5000)
│   ├── config/
│   │   ├── db.ts                   # SQLite database initialization & WAL-mode setup (node:sqlite)
│   │   └── mailer.ts               # Nodemailer transporter & responsive industrial HTML email templates
│   ├── controllers/
│   │   ├── contactController.ts    # Business enquiry & consultation request handler
│   │   ├── manpowerController.ts   # Industrial manpower staffing request handler
│   │   ├── quoteController.ts      # Machinery & tooling quotation handler with CAD file attachments
│   │   └── adminController.ts      # Admin authentication, submission queries, status updates & file download
│   ├── middleware/
│   │   ├── auth.ts                 # Bearer JWT verification middleware for protected routes
│   │   ├── errorHandler.ts         # Centralized error handling (Multer, JSON parsing, 500s)
│   │   ├── rateLimiter.ts          # Express-rate-limit protection against spam and brute-force
│   │   ├── upload.ts               # Multer storage engine for blueprints/CAD files (.dwg, .dxf, .step, .pdf, etc.)
│   │   └── validator.ts            # express-validator schemas & sanitizers for all endpoints
│   ├── models/
│   │   ├── submissionModel.ts      # SQLite CRUD operations, tracking ID generator, filtering, stats & audit logs
│   │   └── userModel.ts            # Admin user authentication, bcrypt password hashing & default account seed
│   └── routes/
│       ├── adminRoutes.ts          # /api/admin routes
│       ├── contactRoutes.ts        # /api/contact route
│       ├── manpowerRoutes.ts       # /api/manpower-request route
│       └── quoteRoutes.ts          # /api/quote-request route
├── data/
│   └── vss_alutech.sqlite          # SQLite persistent database file
├── uploads/                        # Stored CAD files, blueprints, and engineering drawings
├── .env.example                    # Environment variable template
└── BACKEND.md                      # This comprehensive documentation file
```

---

## 2. Installation & Quick Start

### Prerequisites
- Node.js >= 20.0.0 (Node 22.x recommended for built-in high-performance `node:sqlite`)
- npm or bun package manager

### Required Packages
The backend uses modern, lightweight, zero-vulnerability packages:
```bash
npm install express cors dotenv helmet express-rate-limit express-validator multer nodemailer jsonwebtoken bcryptjs
npm install -D @types/express @types/cors @types/multer @types/nodemailer @types/jsonwebtoken @types/bcryptjs tsx
```

### Running the Server

#### Full-Stack Development Mode (Express API + Vite Frontend on Port 3000):
```bash
npm run dev
```

#### Dedicated Standalone Backend Server (Port 5000):
```bash
npm run server
```

#### Production Full-Stack Build & Run:
```bash
npm run build
npm start
```

---

## 3. Database Schema (SQLite)

The database engine runs on **SQLite** with Write-Ahead Logging (`PRAGMA journal_mode = WAL`) and foreign key enforcement.

### Tables

#### 1. `submissions` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique internal ID |
| `tracking_id` | TEXT | UNIQUE NOT NULL | Client-facing tracking reference (e.g. `VSS-CNT-2026-X8K1`) |
| `type` | TEXT | CHECK(type IN ('contact', 'manpower', 'quote')) | Submission classification |
| `name` | TEXT | NOT NULL | Contact person name |
| `email` | TEXT | NOT NULL | Customer email address |
| `phone` | TEXT | NOT NULL | Contact phone / WhatsApp number |
| `company` | TEXT | NULL | Enterprise / plant name |
| `service_category` | TEXT | NULL | Selected operational service category |
| `plant_location` | TEXT | NULL | Factory city / MIDC location |
| `message` | TEXT | NULL | Detailed enquiry or scope statement |
| `details_json` | TEXT | NULL | JSON-serialized structured parameters (shifts, workers, tonnage, etc.) |
| `file_name` | TEXT | NULL | Original filename of uploaded CAD/blueprint |
| `file_path` | TEXT | NULL | Absolute filesystem storage path |
| `file_size` | INTEGER | NULL | File size in bytes |
| `status` | TEXT | DEFAULT 'pending' | `pending`, `in_review`, `quoted`, `resolved`, `archived` |
| `admin_notes` | TEXT | NULL | Internal engineering review notes |
| `admin_email_sent` | INTEGER | DEFAULT 0 | 1 if admin notification succeeded |
| `client_email_sent` | INTEGER | DEFAULT 0 | 1 if auto-acknowledgement succeeded |
| `created_at` | TEXT | NOT NULL | ISO-8601 creation timestamp |
| `updated_at` | TEXT | NOT NULL | ISO-8601 modification timestamp |

#### 2. `admin_users` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Admin user identifier |
| `email` | TEXT | UNIQUE NOT NULL | Administrator login email |
| `password_hash` | TEXT | NOT NULL | bcrypt-hashed password (cost factor 10) |
| `full_name` | TEXT | NOT NULL | Display name |
| `role` | TEXT | DEFAULT 'admin' | `admin`, `superadmin`, `viewer` |
| `created_at` | TEXT | NOT NULL | Creation timestamp |
| `last_login` | TEXT | NULL | Last successful authentication timestamp |

---

## 4. API Endpoints Reference

### 4.1 System & Health

#### `GET /api/health`
Check server status, uptime, and database connectivity.
- **Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "VSS Alutech Solutions Enterprise Backend",
  "version": "1.0.0",
  "database": "SQLite",
  "timestamp": "2026-10-18T19:04:04.462Z"
}
```

---

### 4.2 Form Submissions

#### `POST /api/contact`
Handles general business enquiries, plant setup consultations, and maintenance requests.
- **Rate Limit:** 40 requests / 15 minutes per IP
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "name": "Rajesh Sharma",
  "email": "r.sharma@apexextrusions.in",
  "phone": "+91 98201 44552",
  "company": "Apex Extrusions Pvt Ltd",
  "serviceCategory": "Plant Maintenance and Technical Consultancy",
  "plantLocation": "Chakan MIDC, Pune",
  "message": "Need technical consultation regarding extrusion press hydraulic pressure fluctuations and die deflection."
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Your business enquiry has been successfully logged. Our engineering desk will follow up shortly.",
  "referenceId": "VSS-CNT-2026-X8K102",
  "data": {
    "id": 1,
    "trackingId": "VSS-CNT-2026-X8K102",
    "type": "contact",
    "name": "Rajesh Sharma",
    "company": "Apex Extrusions Pvt Ltd",
    "createdAt": "2026-10-18T19:10:00.000Z"
  }
}
```

---

#### `POST /api/manpower-request`
Handles structured industrial manpower staffing requests for aluminium extrusion plants.
- **Rate Limit:** 40 requests / 15 minutes per IP
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "name": "Vikram Mehta",
  "email": "vikram@gujaratprofiles.com",
  "phone": "+91 97129 88300",
  "company": "Gujarat Aluminium Profiles",
  "plantLocation": "Savli GIDC, Vadodara",
  "designation": "Extrusion Press Operator",
  "workerCount": 4,
  "skillLevel": "Skilled",
  "shiftDetails": "Triple Shift (24x7 Operations)",
  "requirementUrgency": "Immediate (Within 1-2 weeks)",
  "notes": "Must have hands-on experience operating 1100 UST or 1450 UST direct extrusion presses."
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Your industrial manpower staffing request has been logged. Our deployment coordinator will contact you with pre-vetted profiles.",
  "referenceId": "VSS-MPR-2026-8B1K99",
  "data": {
    "id": 2,
    "trackingId": "VSS-MPR-2026-8B1K99",
    "type": "manpower",
    "designation": "Extrusion Press Operator",
    "workerCount": 4,
    "skillLevel": "Skilled",
    "shiftDetails": "Triple Shift (24x7 Operations)",
    "createdAt": "2026-10-18T19:11:00.000Z"
  }
}
```

---

#### `POST /api/quote-request`
Handles detailed machinery, press sizing, furnace, and tooling quotes with file upload support for engineering blueprints and CAD drawings.
- **Rate Limit:** 40 requests / 15 minutes per IP
- **Request Headers:** `Content-Type: multipart/form-data`
- **Supported File Types:** `.pdf`, `.dwg`, `.dxf`, `.step`, `.stp`, `.iges`, `.igs`, `.zip`, `.png`, `.jpg` (Max: 25 MB)
- **Form Fields:**
  - `name` (required): Contact name
  - `email` (required): Business email
  - `phone` (required): Phone number
  - `company`: Enterprise name
  - `machineryType` (required): e.g. "1800 UST Aluminium Extrusion Press Line"
  - `pressTonnage`: e.g. "1800 UST (7-inch container)"
  - `alloyGrades`: e.g. "6063, 6061, 6082"
  - `estimatedBilletSize`: e.g. "7 inch diameter x 36 inch length"
  - `deliveryTimeline`: e.g. "3 to 6 Months"
  - `technicalSpecs`: Scope description
  - `file`: (Optional file attachment)
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Your machinery quotation request and engineering specifications have been successfully received.",
  "referenceId": "VSS-QTE-2026-9F2M10",
  "data": {
    "id": 3,
    "trackingId": "VSS-QTE-2026-9F2M10",
    "type": "quote",
    "machineryType": "1800 UST Aluminium Extrusion Press Line",
    "pressTonnage": "1800 UST",
    "attachment": {
      "originalName": "die_drawing_sample.dwg",
      "sizeBytes": 145220
    },
    "createdAt": "2026-10-18T19:12:00.000Z"
  }
}
```

---

### 4.3 Admin Authentication & Dashboard Portal

#### First-Time Admin Onboarding (`GET /api/admin/setup-status` & `POST /api/admin/setup`)
To prevent public vulnerability, there are **no hardcoded default passwords**.
- When no administrator exists in the database, `GET /api/admin/setup-status` returns `{ "needsSetup": true }`.
- Navigating to `#admin-login` opens the **Initial Admin Setup** form where the administrator securely sets their master password (min 8 characters).
- Once created, `/api/admin/setup` is permanently locked with HTTP `403 Forbidden`.

#### `POST /api/admin/login`
Secure administrator authentication using JSON Web Tokens (JWT) and bcrypt.
- **Rate Limit:** 10 attempts / 15 minutes per IP (brute-force protection)
- **Request Body:**
```json
{
  "email": "admin@vsslutechsolutions.in",
  "password": "YourSecurePassword"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Authentication successful. Welcome to VSS Alutech Admin Portal.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@vsslutechsolutions.in",
    "fullName": "VSS Plant Administrator",
    "role": "superadmin"
  }
}
```

---

#### `GET /api/admin/submissions`
Protected endpoint to list, search, filter, and paginate all stored form enquiries, manpower requests, and quote submissions.
- **Authentication:** `Authorization: Bearer <JWT_TOKEN>`
- **Query Parameters:**
  - `type`: `all` | `contact` | `manpower` | `quote`
  - `status`: `all` | `pending` | `in_review` | `quoted` | `resolved` | `archived`
  - `search`: Keyword string (searches name, email, phone, company, tracking_id)
  - `page`: Page number (default: 1)
  - `limit`: Records per page (default: 20, max: 100)
- **Response (200 OK):**
```json
{
  "success": true,
  "submissions": [
    {
      "id": 3,
      "tracking_id": "VSS-QTE-2026-9F2M10",
      "type": "quote",
      "name": "Vikas Sharma",
      "email": "v.sharma@mpt.in",
      "phone": "+91 94220 88776",
      "company": "MPT Extrusions",
      "status": "pending",
      "details": {
        "Machinery / Tooling Scope": "1800 UST Press",
        "Press Tonnage Capacity": "1800 UST"
      },
      "file_name": "die_drawing_sample.dwg",
      "created_at": "2026-10-18T19:12:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  },
  "stats": {
    "total": 3,
    "byType": { "contact": 1, "manpower": 1, "quote": 1 },
    "byStatus": { "pending": 2, "in_review": 1, "quoted": 0, "resolved": 0, "archived": 0 }
  }
}
```

---

#### `PATCH /api/admin/submissions/:id/status`
Update workflow state and add administrative review notes.
- **Authentication:** `Authorization: Bearer <JWT_TOKEN>`
- **Request Body:**
```json
{
  "status": "in_review",
  "adminNotes": "Drawing forwarded to tool room head Mr. Joshi for die profile feasibility."
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Submission status successfully updated to \"in_review\".",
  "submission": { ... }
}
```

---

#### `DELETE /api/admin/submissions/:id`
Protected route to delete or archive processed inquiries. If an uploaded CAD/blueprint was stored, it is automatically unlinked and purged from disk.
- **Authentication:** `Authorization: Bearer <JWT_TOKEN>`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Submission #3 (VSS-QTE-2026-9F2M10) has been permanently deleted.",
  "deletedId": 3,
  "trackingId": "VSS-QTE-2026-9F2M10"
}
```

---

#### `GET /api/admin/download/:id`
Securely download the CAD drawing or blueprint file uploaded by a customer.
- **Authentication:** `Authorization: Bearer <JWT_TOKEN>`
- **Response:** File binary stream with `Content-Disposition: attachment; filename="<original_name>"`.

---

## 5. Email Notification System (Nodemailer)

Whenever any submission is created:
1. **Administrator Notification:**
   - Dispatched immediately to `info@vsslutechsolutions.in` (or configured `ADMIN_NOTIFICATION_EMAIL`).
   - Contains customer profile, phone call links, company details, structured request specifications, and CAD attachment alerts.
2. **Client Auto-Acknowledgement:**
   - Dispatched directly to the client's email address.
   - Highlights their generated **Tracking Reference ID** (e.g. `VSS-CNT-2026-XXXX`).
   - Outlines next steps (4-hour technical SLA) and emergency plant contacts.
3. **Resilient Safe Mode:**
   - If SMTP is not configured in `.env`, Nodemailer runs in development simulation mode without crashing or blocking form submissions.

---

## 6. Security & Hardening Features

1. **Helmet:** Enforces industry-standard HTTP security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, etc.).
2. **CORS:** Configured to accept requests from localhost, custom domains, and staging URLs with credentials support.
3. **Rate Limiting:** Protects endpoints against spamming, denial-of-service, and brute-force credential stuffing.
4. **Input Sanitization & Validation (`express-validator`):**
   - Normalizes email addresses.
   - Trims and validates phone numbers.
   - Validates ranges for worker counts (1 to 500).
   - Rejects malicious payloads with HTTP 422 Unprocessable Entity.
5. **File Upload Security (`multer`):**
   - Strict file extension whitelist for CAD and blueprints.
   - 25 MB file size limit to prevent disk exhaustion.
   - Files renamed with cryptographically random timestamps to prevent directory traversal or overwrites.
6. **Password Hashing:** Passwords hashed with `bcryptjs` using 10 salt rounds.
7. **JWT Expiration:** Signed with HMAC SHA-256 and expires in 24 hours.

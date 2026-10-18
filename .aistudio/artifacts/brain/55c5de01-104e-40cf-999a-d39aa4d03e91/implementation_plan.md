# VSS Alutech Solutions — Complete Supabase PostgreSQL & Edge Function Backend

A production-ready, enterprise-grade backend infrastructure for VSS Alutech Solutions, powering customer enquiry intake, industrial specification capture, audit logging, Row Level Security (RLS), and instant transactional email notifications via Resend.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed via interactive consultation:
> - **Backend Architecture**: Complete Supabase PostgreSQL backend with Deno TypeScript Edge Functions.
> - **Primary Storage**: Supabase PostgreSQL cloud database (`cvamnocsfuanbwbljblm.supabase.co`) with Row Level Security (RLS) and audit activity history.
> - **Email Notifications**: Resend Transactional Email API with responsive, industrial-branded HTML templates dispatched directly to the configured business inbox.
> - **Payload Flexibility**: The Edge Function supports both minimal (`name`, `email`, `phone`, `company`, `message`) and comprehensive B2B specification payloads (`pressCapacity`, `plantLocation`, `serviceCategory`, `timelineUrgency`, `approxBudget`).

---

## 1. Overview & Core Concept

- **What It Does**: Provides a secure, serverless cloud backend for VSS Alutech Solutions. When industrial clients submit equipment inquiries (press sourcing, furnaces, troubleshooting, tool-room dies, or manpower), the backend validates input, assigns a permanent business tracking reference (e.g. `VSS-2026-X7K890`), commits the record into PostgreSQL, and dispatches a formatted transactional notification to company executives via Resend.
- **Target Audience**: B2B aluminium extrusion plant owners, technical directors, procurement managers, plant heads, and internal VSS Alutech sales/metallurgy engineers.
- **Key Value**: Zero data loss, immediate reference generation for clients, real-time email dispatch, bulletproof security preventing anonymous reads/scrapes, and an executive management suite for enquiry follow-ups.

---

## 2. Technical Architecture & System Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                       CLIENT FRONTEND (React + Vite)                       │
│  - ConsultationSection (B2B Press & Equipment Enquiry Form)                │
│  - ManpowerSupplier (Technical Staffing Form)                              │
│  - AdminDashboard (Executive Leads, Status Updates, CSV Export)            │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
                         HTTPS POST /submit-enquiry
                        (JSON: name, email, phone,
                          company, message, etc.)
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                   SUPABASE EDGE FUNCTION: submit-enquiry                   │
│                                                                            │
│  1. CORS Preflight & Security Headers Check                                │
│  2. Spam Honeypot Detection (Silent Drop for automated bots)               │
│  3. Server-side Validation & Normalization                                 │
│  4. Deterministic Reference ID Generation (VSS-YYYY-XXXXX)                 │
│  5. Service-Role Admin Client Initialization                               │
└───────────────────┬──────────────────────────────────┬─────────────────────┘
                    │                                  │
                    ▼                                  ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────┐
│        POSTGRESQL DATABASE           │  │            RESEND API            │
│                                      │  │                                  │
│  - enquiries (Primary Records)       │  │  - Transactional Notification    │
│  - enquiry_activity (Audit Trail)    │  │  - Executive Inbox Recipient     │
│  - Row Level Security (Admins only)  │  │  - Customer Reply-To Link        │
│  - Automated updated_at triggers     │  │  - Branded Responsive HTML Table │
└──────────────────────────────────────┘  └──────────────────────────────────┘
```

---

## 3. Database Design & Migration Strategy

The database schema will be organized into a single migration file (`supabase/migrations/20261016_complete_backend.sql`) runnable in the Supabase SQL Editor:

### A. Primary Tables

1. **`public.enquiries`**:
   - `id`: UUID (Primary Key, default `gen_random_uuid()`)
   - `reference_id`: `TEXT UNIQUE NOT NULL` (e.g., `VSS-2026-AB123`)
   - `full_name` & `name`: `TEXT NOT NULL` (dual mapped for universal API compatibility)
   - `company_name` & `company`: `TEXT NOT NULL`
   - `phone_number` & `phone`: `TEXT NOT NULL`
   - `email_address` & `email`: `TEXT NOT NULL`
   - `message`: `TEXT NOT NULL`
   - `service_category`: `TEXT` (Extrusion press, furnaces, plant consultancy, dies, manpower)
   - `city_state`: `TEXT`
   - `country`: `TEXT DEFAULT 'India'`
   - `plant_location`: `TEXT`
   - `machinery_required`: `TEXT`
   - `press_capacity`: `TEXT`
   - `technical_specs`: `TEXT`
   - `approx_budget`: `TEXT`
   - `project_stage`: `TEXT`
   - `timeline_urgency`: `TEXT`
   - `preferred_contact`: `TEXT DEFAULT 'WhatsApp'`
   - `status`: `TEXT NOT NULL DEFAULT 'new'` (`new`, `in_review`, `contacted`, `proposal_sent`, `won`, `lost`, `archived`)
   - `email_status`: `TEXT DEFAULT 'pending'` (`pending`, `sent`, `failed`, `skipped`)
   - `email_provider_id`: `TEXT` (Resend message ID)
   - `email_error`: `TEXT`
   - `admin_notes`: `TEXT`
   - `created_at` & `updated_at`: `TIMESTAMPTZ DEFAULT NOW()`

2. **`public.enquiry_activity`**:
   - `id`: UUID (Primary Key)
   - `enquiry_id`: UUID (Foreign Key references `enquiries(id)` ON DELETE CASCADE)
   - `action`: `TEXT NOT NULL` (e.g., "Enquiry Received", "Email Notification Sent", "Status Changed")
   - `details`: `JSONB`
   - `performed_by`: `TEXT NOT NULL`
   - `created_at`: `TIMESTAMPTZ DEFAULT NOW()`

### B. Row Level Security (RLS)
- Anonymous / Public users have **no SELECT, UPDATE, or DELETE access** to `enquiries`.
- Anonymous users can only submit via the server-side Edge Function (which uses `SUPABASE_SERVICE_ROLE_KEY`).
- Authenticated admin users (`auth.role() = 'authenticated'`) have full SELECT and UPDATE permissions to manage enquiries in the dashboard.

---

## 4. Supabase Edge Functions Suite

1. **`submit-enquiry`** (`supabase/functions/submit-enquiry/index.ts`):
   - Accepts both compact payload (`{ name, email, phone, company, message }`) and extended B2B parameters.
   - Computes reference ID and sanitizes inputs.
   - Inserts record into `public.enquiries` with service-role privileges.
   - Dispatches Resend email notification using `RESEND_API_KEY`.
   - Records an entry in `public.enquiry_activity`.
   - Returns clean JSON `{ success: true, referenceId: "...", emailStatus: "sent", message: "..." }` with HTTP 200/201.

2. **`retry-email`** (`supabase/functions/retry-email/index.ts`):
   - Authenticated admin endpoint to re-dispatch notifications if Resend was temporarily unreachable during initial submission.

3. **`_shared/resend.ts`**:
   - Generates responsive HTML and plaintext email templates using VSS Alutech Solutions branding (Deep Navy `#0A192F` and Industrial Orange `#FF6B00`).

---

## 5. Deployment & Configuration Deliverables

To make setup effortless, the codebase will include:
1. **Ready-to-run SQL Migration**: Complete SQL script in `supabase/migrations/20261016_complete_backend.sql` ready to paste into Supabase SQL Editor in 1 click.
2. **Supabase CLI Deployment Script**: Shell/NPM script to deploy edge functions with a single command:
   ```bash
   npx supabase functions deploy submit-enquiry --project-ref cvamnocsfuanbwbljblm
   ```
3. **Environment Secrets Guide**: Clear checklist for Supabase secrets (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `BUSINESS_NOTIFICATION_EMAIL`, `RESEND_FROM_EMAIL`).
4. **Client Service Sync**: Verification that `src/services/enquiryService.ts` and `src/components/ConsultationSection.tsx` remain strictly coupled to the live endpoint with verified 200/201 response checks.

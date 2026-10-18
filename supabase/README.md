# VSS Alutech Solutions — Complete Backend Setup Guide

This directory contains the production backend for VSS Alutech Solutions, built on **Supabase PostgreSQL** and **Supabase Edge Functions** (Deno) with **Resend** transactional email integration.

---

## 1. Quick Setup (3 Simple Steps)

### Step 1: Run the Database Migration in Supabase

1. Open your Supabase project dashboard:
   👉 **https://supabase.com/dashboard/project/cvamnocsfuanbwbljblm**
2. In the left navigation menu, click **SQL Editor**.
3. Click **New Query**.
4. Open the file `supabase/migrations/20261016_complete_backend.sql` in this project, copy all its contents, and paste them into the SQL Editor.
5. Click **Run** (green button).
   - This creates the `public.enquiries` table with dual-schema mapping (`name` & `full_name`, `email` & `email_address`, `phone` & `phone_number`, `company` & `company_name`).
   - This configures Row Level Security (RLS) policies so public visitors can submit, while only authenticated admins can read and update.
   - This creates high-performance database indexes and the `public.enquiry_activity` audit trail table.

---

### Step 2: Configure Backend Environment Secrets

In the Supabase Dashboard, go to **Project Settings** > **Edge Functions** (or **Edge Functions** in the left sidebar):

Add these 4 secrets:

| Secret Name | Value | Description |
| :--- | :--- | :--- |
| `SUPABASE_URL` | `https://cvamnocsfuanbwbljblm.supabase.co` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | *(From Project Settings > API > service_role secret)* | Allows Edge Function to write securely to PostgreSQL |
| `RESEND_API_KEY` | `re_123456789...` | Your Resend API key (from https://resend.com/api-keys) |
| `BUSINESS_NOTIFICATION_EMAIL`| `info@vsslutechsolutions.in` (or your personal inbox) | The inbox where new customer enquiry emails are delivered |
| `RESEND_FROM_EMAIL` | `enquiries@vssalutechsolutions.in` | Sender address (or `onboarding@resend.dev` for testing) |

*(Alternatively, if using the Supabase CLI, run:*
```bash
npx supabase secrets set \
  SUPABASE_URL="https://cvamnocsfuanbwbljblm.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
  RESEND_API_KEY="your-resend-api-key" \
  BUSINESS_NOTIFICATION_EMAIL="info@vsslutechsolutions.in" \
  RESEND_FROM_EMAIL="onboarding@resend.dev" \
  --project-ref cvamnocsfuanbwbljblm
```
*)*

---

### Step 3: Deploy the Edge Function

From the root of your project directory in your terminal, run:

```bash
# Log in to Supabase CLI (if not already logged in)
npx supabase login

# Deploy the submit-enquiry function
npx supabase functions deploy submit-enquiry --project-ref cvamnocsfuanbwbljblm --no-verify-jwt
```

*(Note: `--no-verify-jwt` allows public website visitors to submit without requiring prior user login, while still keeping your database secure through server-side validation).*

---

## 2. Testing Your Backend

### Test via Terminal (cURL):
```bash
curl -i --location --request POST 'https://cvamnocsfuanbwbljblm.supabase.co/functions/v1/submit-enquiry' \
--header 'Content-Type: application/json' \
--data '{
  "name": "Rajesh Sharma",
  "email": "rajesh@apexextrusions.in",
  "phone": "+91 98201 44552",
  "company": "Apex Extrusions Pvt Ltd",
  "message": "Need technical consultation for 1450 UST Extrusion Press line expansion."
}'
```

**Expected Response (HTTP 201 Created):**
```json
{
  "success": true,
  "referenceId": "VSS-2026-X9K201",
  "emailStatus": "sent",
  "message": "Your enquiry has been successfully registered and sent to our engineering team."
}
```

---

## 3. Verifying the Database

1. Go to **Supabase Dashboard** > **Table Editor** > **`enquiries`**.
2. You will see the new enquiry row with reference ID, company name, contact numbers, and timestamps.
3. Open **`enquiry_activity`** to see the timestamped audit log of the submission.
4. Check your configured inbox (`BUSINESS_NOTIFICATION_EMAIL`) to see the branded VSS Alutech Solutions HTML email notification!

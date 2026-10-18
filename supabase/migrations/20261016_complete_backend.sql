-- ============================================================================
-- VSS Alutech Solutions — Complete Production B2B Backend Schema
-- Platform: Supabase PostgreSQL with Row Level Security (RLS)
-- Project: cvamnocsfuanbwbljblm
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. Create Enquiries Table
-- Supports both standard and compact payload fields seamlessly
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id TEXT UNIQUE NOT NULL,
    
    -- Dual column mapping for universal compatibility
    name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    email_address TEXT NOT NULL,
    phone TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    company TEXT NOT NULL,
    company_name TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- B2B Industrial Context & Categorization
    service_category TEXT NOT NULL DEFAULT 'Aluminium extrusion press solutions',
    city_state TEXT DEFAULT 'India',
    country TEXT NOT NULL DEFAULT 'India',
    
    -- Technical Specifications
    plant_location TEXT,
    machinery_required TEXT,
    press_capacity TEXT,
    technical_specs TEXT,
    approx_budget TEXT,
    project_stage TEXT,
    timeline_urgency TEXT,
    preferred_contact TEXT DEFAULT 'WhatsApp',
    additional_notes TEXT,
    attachment_name TEXT,
    attachment_size_mb TEXT,
    
    -- Administrative Workflow & Status
    status TEXT NOT NULL DEFAULT 'new' 
        CHECK (status IN ('new', 'in_review', 'contacted', 'proposal_sent', 'won', 'lost', 'archived')),
    admin_notes TEXT,
    
    -- Transactional Email Tracking (Resend)
    email_status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (email_status IN ('pending', 'sent', 'failed', 'skipped')),
    email_provider_id TEXT,
    email_error TEXT,
    email_sent_at TIMESTAMPTZ,
    
    -- Metadata
    ip_address TEXT,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 2. Dual-Sync Column Trigger
-- Automatically synchronizes name <-> full_name, email <-> email_address, etc.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_enquiry_columns()
RETURNS TRIGGER AS $$
BEGIN
    -- Synchronize Name
    IF NEW.name IS NOT NULL AND (NEW.full_name IS NULL OR NEW.full_name = '') THEN
        NEW.full_name := NEW.name;
    ELSIF NEW.full_name IS NOT NULL AND (NEW.name IS NULL OR NEW.name = '') THEN
        NEW.name := NEW.full_name;
    END IF;

    -- Synchronize Email
    IF NEW.email IS NOT NULL AND (NEW.email_address IS NULL OR NEW.email_address = '') THEN
        NEW.email_address := NEW.email;
    ELSIF NEW.email_address IS NOT NULL AND (NEW.email IS NULL OR NEW.email = '') THEN
        NEW.email := NEW.email_address;
    END IF;

    -- Synchronize Phone
    IF NEW.phone IS NOT NULL AND (NEW.phone_number IS NULL OR NEW.phone_number = '') THEN
        NEW.phone_number := NEW.phone;
    ELSIF NEW.phone_number IS NOT NULL AND (NEW.phone IS NULL OR NEW.phone = '') THEN
        NEW.phone := NEW.phone_number;
    END IF;

    -- Synchronize Company
    IF NEW.company IS NOT NULL AND (NEW.company_name IS NULL OR NEW.company_name = '') THEN
        NEW.company_name := NEW.company;
    ELSIF NEW.company_name IS NOT NULL AND (NEW.company IS NULL OR NEW.company = '') THEN
        NEW.company := NEW.company_name;
    END IF;

    -- Update updated_at timestamp
    NEW.updated_at := timezone('utc'::text, now());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_enquiry_columns ON public.enquiries;
CREATE TRIGGER trg_sync_enquiry_columns
    BEFORE INSERT OR UPDATE ON public.enquiries
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_enquiry_columns();

-- ----------------------------------------------------------------------------
-- 3. Create Audit Trail & Activity Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enquiry_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enquiry_id UUID NOT NULL REFERENCES public.enquiries(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB,
    performed_by TEXT NOT NULL DEFAULT 'System',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 4. High-Performance Indexes
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_enquiries_reference_id ON public.enquiries (reference_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries (status);
CREATE INDEX IF NOT EXISTS idx_enquiries_company ON public.enquiries (company_name);
CREATE INDEX IF NOT EXISTS idx_enquiries_email ON public.enquiries (email_address);
CREATE INDEX IF NOT EXISTS idx_activity_enquiry_id ON public.enquiry_activity (enquiry_id);

-- ----------------------------------------------------------------------------
-- 5. Row Level Security (RLS) Configuration
-- ----------------------------------------------------------------------------
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiry_activity ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if re-running
DROP POLICY IF EXISTS "Public web visitors can submit enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Allow service role full access" ON public.enquiries;
DROP POLICY IF EXISTS "Authenticated admins can view enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Authenticated admins can update enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Allow service role full access on activity" ON public.enquiry_activity;
DROP POLICY IF EXISTS "Authenticated admins can view activity" ON public.enquiry_activity;

-- A. Service role bypass (Used by Edge Functions)
CREATE POLICY "Allow service role full access"
    ON public.enquiries
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow service role full access on activity"
    ON public.enquiry_activity
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- B. Direct public submissions (If client uses anon key directly as fallback)
CREATE POLICY "Public web visitors can submit enquiries"
    ON public.enquiries
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- C. Authenticated dashboard access (Admins logged in via Supabase Auth)
CREATE POLICY "Authenticated admins can view enquiries"
    ON public.enquiries
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated admins can update enquiries"
    ON public.enquiries
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated admins can view activity"
    ON public.enquiry_activity
    FOR SELECT
    TO authenticated
    USING (true);

-- ----------------------------------------------------------------------------
-- 6. Initial Seed Data (Only seeds if table is currently empty)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.enquiries LIMIT 1) THEN
        INSERT INTO public.enquiries (
            reference_id, name, full_name, email, email_address, phone, phone_number,
            company, company_name, city_state, country, service_category, message,
            plant_location, machinery_required, press_capacity, approx_budget,
            project_stage, timeline_urgency, status, email_status
        ) VALUES 
        (
            'VSS-2026-X9K201', 'Rajesh Sharma', 'Rajesh Sharma',
            'r.sharma@apexextrusions.in', 'r.sharma@apexextrusions.in',
            '+91 98201 44552', '+91 98201 44552',
            'Apex Extrusions Pvt Ltd', 'Apex Extrusions Pvt Ltd',
            'Pune, Maharashtra', 'India',
            'Aluminium extrusion press solutions',
            'Requirement for 1450 UST direct extrusion press with complete handling table and hot log shear.',
            'Chakan MIDC Phase 2, Pune',
            '1450 UST Extrusion Press with Puller and Handling Table',
            '1450 UST (7-inch container)', '₹2.5 Cr - ₹3.2 Cr',
            'Plant Expansion / Line Addition', '1 to 3 Months',
            'in_review', 'sent'
        ),
        (
            'VSS-2026-F4N812', 'Vikram Mehta', 'Vikram Mehta',
            'vikram@gujaratprofiles.com', 'vikram@gujaratprofiles.com',
            '+91 97129 88300', '+91 97129 88300',
            'Gujarat Aluminium Profiles', 'Gujarat Aluminium Profiles',
            'Vadodara, Gujarat', 'India',
            'Furnace selection, setup and execution',
            'Current furnace has high scale loss and temperature gradient across billets. Need rapid billet heater.',
            'Savli GIDC, Vadodara',
            'LPG Gas-Fired Rapid Billet Heater with Hot Log Shear',
            'For 1100 UST Press (5-inch & 6-inch logs)', '₹45 Lakhs - ₹60 Lakhs',
            'Machinery Replacement / Modernization', 'Immediate (Within 1-2 weeks)',
            'new', 'sent'
        );
    END IF;
END $$;

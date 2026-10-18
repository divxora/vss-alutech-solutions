-- ============================================================================
-- VSS Alutech Solutions — B2B Enquiries Database Migration
-- Architecture: Supabase PostgreSQL with Row Level Security (RLS)
-- ============================================================================

-- Ensure pgcrypto or uuid-ossp for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create Enquiries Table
CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id TEXT UNIQUE NOT NULL,
    
    -- Customer & Company Details
    full_name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email_address TEXT NOT NULL,
    city_state TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    
    -- Core Requirement
    service_category TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- Optional Technical Specifications
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
    
    -- Lead Status & Internal Notes
    status TEXT NOT NULL DEFAULT 'new' 
        CHECK (status IN ('new', 'in_review', 'contacted', 'proposal_sent', 'won', 'lost', 'archived')),
    admin_notes TEXT,
    
    -- Transactional Email Notification Tracking (Resend)
    email_status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (email_status IN ('pending', 'sent', 'failed', 'skipped')),
    email_provider_id TEXT,
    email_error TEXT,
    email_sent_at TIMESTAMPTZ,
    
    -- Security & Network Metadata
    ip_address TEXT,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create Audit Trail & Activity History Table
CREATE TABLE IF NOT EXISTS public.enquiry_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enquiry_id UUID NOT NULL REFERENCES public.enquiries(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    performed_by TEXT NOT NULL DEFAULT 'System',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Optimized Indexes for High-Speed B2B Queries
CREATE INDEX IF NOT EXISTS idx_enquiries_reference_id ON public.enquiries(reference_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_email_status ON public.enquiries(email_status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_company_name ON public.enquiries(company_name);
CREATE INDEX IF NOT EXISTS idx_enquiries_service_category ON public.enquiries(service_category);
CREATE INDEX IF NOT EXISTS idx_enquiry_activity_enquiry_id ON public.enquiry_activity(enquiry_id);

-- 4. Automatic updated_at Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_enquiries_updated_at ON public.enquiries;
CREATE TRIGGER trigger_enquiries_updated_at
    BEFORE UPDATE ON public.enquiries
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 5. Row Level Security (RLS) Configuration
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiry_activity ENABLE ROW LEVEL SECURITY;

-- Anonymous (public) visitors cannot read enquiries
DROP POLICY IF EXISTS "Public visitors cannot read enquiries" ON public.enquiries;
-- (Implicitly denied by RLS when no public policy exists)

-- Authenticated admins can view, update, and manage all enquiries
DROP POLICY IF EXISTS "Authenticated admins can select enquiries" ON public.enquiries;
CREATE POLICY "Authenticated admins can select enquiries"
    ON public.enquiries
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated admins can update enquiries" ON public.enquiries;
CREATE POLICY "Authenticated admins can update enquiries"
    ON public.enquiries
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Authenticated admins can view and record activities
DROP POLICY IF EXISTS "Authenticated admins can select activity" ON public.enquiry_activity;
CREATE POLICY "Authenticated admins can select activity"
    ON public.enquiry_activity
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated admins can insert activity" ON public.enquiry_activity;
CREATE POLICY "Authenticated admins can insert activity"
    ON public.enquiry_activity
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- The Edge Function uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS securely on the server.

// ============================================================================
// Supabase Edge Function: submit-enquiry
// Dual-Compatible Payload Ingestion, PostgreSQL Storage, and Resend Notification
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import {
  generateEmailHtml,
  generateEmailText,
  generateEmailSubject,
} from '../_shared/resend.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  // 1. Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));

    // 2. Anti-spam honeypot detection
    if (body.honeypot && String(body.honeypot).trim().length > 0) {
      console.warn('Bot submission blocked via honeypot field.');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Bot verification failed.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // 3. Normalize dual-schema fields
    // Supports { name, email, phone, company, message }
    // as well as { fullName, emailAddress, phoneNumber, companyName, message, ... }
    const name = String(body.name || body.fullName || '').trim();
    const email = String(body.email || body.emailAddress || '').trim().toLowerCase();
    const phone = String(body.phone || body.phoneNumber || '').trim();
    const company = String(body.company || body.companyName || '').trim();
    const message = String(body.message || '').trim();

    const serviceCategory = String(
      body.serviceCategory || body.service || 'Aluminium extrusion press solutions'
    ).trim();
    const cityState = String(body.cityState || body.location || 'India').trim();
    const country = String(body.country || 'India').trim();

    // 4. Input validation
    if (name.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Customer name is required (minimum 2 characters).' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (company.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Company or business name is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (phone.length < 7) {
      return new Response(
        JSON.stringify({ error: 'Valid phone or WhatsApp number is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!email.includes('@') || !email.includes('.')) {
      return new Response(
        JSON.stringify({ error: 'Valid business email address is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (message.length < 3) {
      return new Response(
        JSON.stringify({ error: 'Requirement message cannot be empty.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Compute Business Reference ID
    const year = new Date().getFullYear();
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const referenceId =
      body.referenceId || `VSS-${year}-${randomSuffix}${Date.now().toString().slice(-3)}`;

    // 6. Initialize Supabase Admin Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase server environment variables missing.');
      return new Response(
        JSON.stringify({
          error: 'Backend service misconfigured. Missing SUPABASE_SERVICE_ROLE_KEY.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 7. Insert Record into PostgreSQL
    const clientIp =
      req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || '';
    const userAgent = req.headers.get('user-agent') || '';

    const insertRecord = {
      reference_id: referenceId,
      name,
      full_name: name,
      email,
      email_address: email,
      phone,
      phone_number: phone,
      company,
      company_name: company,
      service_category: serviceCategory,
      message,
      city_state: cityState,
      country,
      plant_location: body.plantLocation ? String(body.plantLocation).trim() : null,
      machinery_required: body.machineryRequired ? String(body.machineryRequired).trim() : null,
      press_capacity: body.pressCapacity ? String(body.pressCapacity).trim() : null,
      technical_specs: body.technicalSpecs ? String(body.technicalSpecs).trim() : null,
      approx_budget: body.approxBudget ? String(body.approxBudget).trim() : null,
      project_stage: body.projectStage ? String(body.projectStage).trim() : null,
      timeline_urgency: body.timelineUrgency ? String(body.timelineUrgency).trim() : null,
      preferred_contact: body.preferredContact ? String(body.preferredContact).trim() : 'WhatsApp',
      additional_notes: body.additionalNotes ? String(body.additionalNotes).trim() : null,
      attachment_name: body.attachmentName || null,
      attachment_size_mb: body.attachmentSizeMB || null,
      status: 'new',
      email_status: 'pending',
      ip_address: clientIp,
      user_agent: userAgent,
    };

    const { data: insertedEnquiry, error: dbError } = await supabaseAdmin
      .from('enquiries')
      .insert(insertRecord)
      .select('id, reference_id, created_at')
      .single();

    if (dbError || !insertedEnquiry) {
      console.error('Database insertion error:', dbError);
      return new Response(
        JSON.stringify({
          error: dbError?.message || 'Database error: Failed to record enquiry.',
          details: dbError?.details || null,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 8. Transactional Email Dispatch via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const resendFromEmail =
      Deno.env.get('RESEND_FROM_EMAIL') || 'enquiries@vssalutechsolutions.in';
    const businessInbox =
      Deno.env.get('BUSINESS_NOTIFICATION_EMAIL') || 'info@vsslutechsolutions.in';

    let emailStatus = 'pending';
    let emailProviderId = null;
    let emailErrorMsg = null;

    if (resendApiKey) {
      try {
        const submissionDate =
          new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'full',
            timeStyle: 'medium',
          }) + ' (IST)';

        const emailData = {
          referenceId,
          submissionDate,
          fullName: name,
          companyName: company,
          phoneNumber: phone,
          emailAddress: email,
          cityState,
          country,
          serviceCategory,
          plantLocation: body.plantLocation,
          machineryRequired: body.machineryRequired,
          pressCapacity: body.pressCapacity,
          technicalSpecs: body.technicalSpecs,
          approxBudget: body.approxBudget,
          projectStage: body.projectStage,
          timelineUrgency: body.timelineUrgency,
          preferredContact: body.preferredContact,
          message,
          currentStatus: 'new',
        };

        const subject = generateEmailSubject(company, serviceCategory);
        const html = generateEmailHtml(emailData);
        const text = generateEmailText(emailData);

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: resendFromEmail,
            to: [businessInbox],
            reply_to: email,
            subject,
            html,
            text,
          }),
        });

        if (resendRes.ok) {
          const resendData = await resendRes.json();
          emailStatus = 'sent';
          emailProviderId = resendData.id;
        } else {
          const errData = await resendRes.text();
          console.error('Resend delivery error:', errData);
          emailStatus = 'failed';
          emailErrorMsg = `Resend HTTP ${resendRes.status}: ${errData}`;
        }
      } catch (emailErr: unknown) {
        console.error('Resend invocation exception:', emailErr);
        emailStatus = 'failed';
        emailErrorMsg = emailErr instanceof Error ? emailErr.message : String(emailErr);
      }
    } else {
      console.warn('RESEND_API_KEY secret not found. Email notification marked pending.');
      emailStatus = 'pending';
      emailErrorMsg = 'RESEND_API_KEY environment variable not configured.';
    }

    // 9. Update Enquiry with Email Status
    await supabaseAdmin
      .from('enquiries')
      .update({
        email_status: emailStatus,
        email_provider_id: emailProviderId,
        email_error: emailErrorMsg,
        email_sent_at: emailStatus === 'sent' ? new Date().toISOString() : null,
      })
      .eq('id', insertedEnquiry.id);

    // 10. Record Audit Trail Activity
    await supabaseAdmin.from('enquiry_activity').insert({
      enquiry_id: insertedEnquiry.id,
      action: 'Enquiry Received via Web Portal',
      details: {
        referenceId,
        company,
        emailStatus,
        emailProviderId,
      },
      performed_by: 'Public Visitor',
    });

    // 11. Return Success Response (HTTP 201 Created)
    return new Response(
      JSON.stringify({
        success: true,
        referenceId,
        emailStatus,
        message:
          emailStatus === 'sent'
            ? 'Your enquiry has been successfully registered and sent to our engineering team.'
            : 'Your enquiry has been securely saved. Our engineering team has been notified.',
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (globalError: unknown) {
    console.error('Fatal Edge Function error:', globalError);
    const msg = globalError instanceof Error ? globalError.message : 'Internal server error.';
    return new Response(
      JSON.stringify({ error: 'Server error processing enquiry: ' + msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

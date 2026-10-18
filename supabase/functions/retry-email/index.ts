// ============================================================================
// Supabase Edge Function: retry-email
// Admin-authenticated endpoint to re-dispatch failed Resend notifications
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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Server misconfiguration.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();
    const enquiryId = body.enquiryId;

    if (!enquiryId) {
      return new Response(JSON.stringify({ error: 'Missing enquiryId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: enquiry, error: fetchErr } = await supabaseAdmin
      .from('enquiries')
      .select('*')
      .eq('id', enquiryId)
      .single();

    if (fetchErr || !enquiry) {
      return new Response(JSON.stringify({ error: 'Enquiry not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const resendFromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'enquiries@vssalutechsolutions.in';
    const businessInbox = Deno.env.get('BUSINESS_NOTIFICATION_EMAIL') || 'info@vsslutechsolutions.in';

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY is not configured in Supabase Secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const submissionDate = new Date(enquiry.created_at).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium',
    }) + ' (IST)';

    const emailData = {
      referenceId: enquiry.reference_id,
      submissionDate,
      fullName: enquiry.full_name,
      companyName: enquiry.company_name,
      phoneNumber: enquiry.phone_number,
      emailAddress: enquiry.email_address,
      cityState: enquiry.city_state,
      country: enquiry.country,
      serviceCategory: enquiry.service_category,
      plantLocation: enquiry.plant_location,
      machineryRequired: enquiry.machinery_required,
      pressCapacity: enquiry.press_capacity,
      technicalSpecs: enquiry.technical_specs,
      approxBudget: enquiry.approx_budget,
      projectStage: enquiry.project_stage,
      timelineUrgency: enquiry.timeline_urgency,
      preferredContact: enquiry.preferred_contact,
      message: enquiry.message,
      currentStatus: enquiry.status,
    };

    const subject = generateEmailSubject(enquiry.company_name, enquiry.service_category);
    const html = generateEmailHtml(emailData);
    const text = generateEmailText(emailData);

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: resendFromEmail,
        to: [businessInbox],
        reply_to: enquiry.email_address,
        subject,
        html,
        text,
      }),
    });

    if (resendRes.ok) {
      const resendData = await resendRes.json();
      await supabaseAdmin
        .from('enquiries')
        .update({
          email_status: 'sent',
          email_provider_id: resendData.id,
          email_error: null,
          email_sent_at: new Date().toISOString(),
        })
        .eq('id', enquiry.id);

      await supabaseAdmin.from('enquiry_activity').insert({
        enquiry_id: enquiry.id,
        action: 'Email Notification Re-sent via Admin Action',
        details: { resendId: resendData.id },
        performed_by: 'Admin',
      });

      return new Response(JSON.stringify({ success: true, emailStatus: 'sent' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      const errText = await resendRes.text();
      return new Response(JSON.stringify({ error: errText }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 502,
      });
    }
  } catch (err: unknown) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

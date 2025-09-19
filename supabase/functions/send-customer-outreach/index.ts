import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { AcknowledgmentEmail } from './_templates/acknowledgment-email.tsx';
import { ResolutionEmail } from './_templates/resolution-email.tsx';
import { PraiseResponseEmail } from './_templates/praise-response-email.tsx';
import { EscalationEmail } from './_templates/escalation-email.tsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OutreachRequest {
  feedbackId: string;
  method: 'email';
  messageContent?: string;
  templateType?: 'acknowledgment' | 'resolution' | 'praise' | 'escalation' | 'custom';
  resolutionNotes?: string;
  actionTaken?: string;
  escalationReason?: string;
  managerContact?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { 
      feedbackId, 
      method, 
      messageContent, 
      templateType,
      resolutionNotes,
      actionTaken,
      escalationReason,
      managerContact
    }: OutreachRequest = await req.json();
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY environment variable is not set');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const resend = new Resend(resendApiKey);
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    console.log('Using Resend API key (first 10 chars):', resendApiKey.substring(0, 10));
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Generate a unique thread ID for this email conversation
    const emailThreadId = `feedback-${feedbackId}-${Date.now()}`;

    console.log('Processing outreach request:', { feedbackId, method });

    // Get feedback details
    const { data: feedback, error: feedbackError } = await supabase
      .from('customer_feedback')
      .select('*')
      .eq('id', feedbackId)
      .single();

    if (feedbackError || !feedback) {
      console.error('Feedback not found:', feedbackError);
      return new Response(
        JSON.stringify({ error: 'Feedback not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!feedback.customer_email) {
      return new Response(
        JSON.stringify({ error: 'Customer email not available' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create outreach log entry
    const { data: outreachLog, error: logError } = await supabase
      .from('customer_outreach_log')
      .insert({
        feedback_id: feedbackId,
        direction: 'outbound',
        outreach_method: method,
        message_content: messageContent || `Thank you for your feedback regarding your visit to our store #${feedback.store_number}. We take all customer feedback seriously and are working to address your concerns.`,
        delivery_status: 'pending',
        email_thread_id: emailThreadId,
        from_email: 'onboarding@resend.dev',
        to_email: feedback.customer_email
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating outreach log:', logError);
      return new Response(
        JSON.stringify({ error: 'Failed to create outreach log' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine template type based on feedback if not explicitly provided
    const selectedTemplateType = templateType || determineTemplateType(feedback);
    
    // Generate email content using appropriate template
    const emailContent = await generateEmailContent(
      selectedTemplateType,
      feedback,
      {
        messageContent,
        resolutionNotes,
        actionTaken,
        escalationReason,
        managerContact
      }
    );

    try {
      const emailResponse = await resend.emails.send({
        from: 'Guest Feedback <guestfeedback@atlaswe.com>',
        to: [feedback.customer_email],
        reply_to: 'jchung@atlaswe.com',
        subject: emailContent.subject,
        html: emailContent.html,
      });

      console.log('Resend API response:', JSON.stringify(emailResponse, null, 2));
      
      if (emailResponse.error) {
        throw new Error(`Resend API error: ${JSON.stringify(emailResponse.error)}`);
      }
      
      if (!emailResponse.data) {
        throw new Error(`No data returned from Resend: ${JSON.stringify(emailResponse)}`);
      }

      console.log('Email sent successfully with ID:', emailResponse.data.id);

      // Update outreach log with success and email message ID
      await supabase
        .from('customer_outreach_log')
        .update({ 
          delivery_status: 'delivered',
          email_message_id: emailResponse.data.id,
          subject: emailContent.subject
        })
        .eq('id', outreachLog.id);

      // Update feedback record with outreach info
      await supabase
        .from('customer_feedback')
        .update({
          outreach_sent_at: new Date().toISOString(),
          outreach_method: method
        })
        .eq('id', feedbackId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Outreach email sent successfully',
          outreachLogId: outreachLog.id 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } catch (emailError: any) {
      console.error('Error sending email:', emailError);
      
      // Update outreach log with failure
      await supabase
        .from('customer_outreach_log')
        .update({ delivery_status: 'failed' })
        .eq('id', outreachLog.id);

      return new Response(
        JSON.stringify({ error: 'Failed to send email: ' + emailError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error('Error in send-customer-outreach function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

// Helper function to determine template type based on feedback characteristics
function determineTemplateType(feedback: any): 'acknowledgment' | 'resolution' | 'praise' | 'escalation' {
  // If feedback is praise, use praise template
  if (feedback.complaint_category === 'Praise') {
    return 'praise';
  }
  
  // If feedback is critical priority, use escalation template
  if (feedback.priority === 'Critical') {
    return 'escalation';
  }
  
  // If feedback has resolution notes, use resolution template
  if (feedback.resolution_status === 'resolved' || feedback.resolution_notes) {
    return 'resolution';
  }
  
  // Default to acknowledgment template
  return 'acknowledgment';
}

// Helper function to generate email content using React Email templates
async function generateEmailContent(
  templateType: string,
  feedback: any,
  options: {
    messageContent?: string;
    resolutionNotes?: string;
    actionTaken?: string;
    escalationReason?: string;
    managerContact?: string;
  }
): Promise<{ subject: string; html: string }> {
  const baseProps = {
    customerName: feedback.customer_name,
    caseNumber: feedback.case_number,
    feedbackDate: feedback.feedback_date,
    feedbackText: feedback.feedback_text,
    storeNumber: feedback.store_number,
    category: feedback.complaint_category,
  };

  let subject: string;
  let emailComponent: any;

  switch (templateType) {
    case 'praise':
      subject = `Thank you for your kind words! - Case #${feedback.case_number}`;
      emailComponent = React.createElement(PraiseResponseEmail, {
        ...baseProps,
        storeTeam: `the team at Store #${feedback.store_number}`,
      });
      break;

    case 'escalation':
      subject = `URGENT: Your feedback has been escalated - Case #${feedback.case_number}`;
      emailComponent = React.createElement(EscalationEmail, {
        ...baseProps,
        priority: feedback.priority,
        escalationReason: options.escalationReason || 'High priority feedback requiring immediate management attention',
        managerContact: options.managerContact,
      });
      break;

    case 'resolution':
      subject = `Update on your feedback - Resolution - Case #${feedback.case_number}`;
      emailComponent = React.createElement(ResolutionEmail, {
        ...baseProps,
        resolutionNotes: options.resolutionNotes || feedback.resolution_notes,
        actionTaken: options.actionTaken,
      });
      break;

    case 'custom':
      // For custom messages, fall back to simple HTML
      subject = `Thank you for your feedback - Case #${feedback.case_number}`;
      return {
        subject,
        html: options.messageContent || `
          <h2>Thank you for your feedback</h2>
          <p>Dear ${feedback.customer_name || 'Valued Customer'},</p>
          <p>Thank you for taking the time to share your feedback with us.</p>
          <p><strong>Case Number:</strong> ${feedback.case_number}</p>
          <p>Best regards,<br>Customer Service Team</p>
        `
      };

    case 'acknowledgment':
    default:
      subject = `Thank you for your feedback - Case #${feedback.case_number}`;
      emailComponent = React.createElement(AcknowledgmentEmail, {
        ...baseProps,
        priority: feedback.priority,
      });
      break;
  }

  const html = await renderAsync(emailComponent);
  return { subject, html };
}

serve(handler);
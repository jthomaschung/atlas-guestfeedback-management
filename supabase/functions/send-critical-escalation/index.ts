import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EscalationRequest {
  feedbackId: string;
  escalationType: 'critical' | 'sla_violation';
}

interface ExecutiveRecipient {
  user_id: string;
  email: string;
  display_name: string;
  role: string;
  notification_level: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { feedbackId, escalationType }: EscalationRequest = await req.json();

    if (!feedbackId) {
      throw new Error('Feedback ID is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get feedback details
    const { data: feedback, error: feedbackError } = await supabase
      .from('customer_feedback')
      .select('*')
      .eq('id', feedbackId)
      .single();

    if (feedbackError || !feedback) {
      throw new Error(`Failed to fetch feedback: ${feedbackError?.message}`);
    }

    // Get executive hierarchy for notifications
    const { data: executives, error: executivesError } = await supabase
      .rpc('get_executive_hierarchy', {
        feedback_market: feedback.market,
        feedback_store: feedback.store_number
      });

    if (executivesError) {
      throw new Error(`Failed to get executives: ${executivesError.message}`);
    }

    if (!executives || executives.length === 0) {
      console.log('No executives found for escalation');
      return new Response(JSON.stringify({ 
        success: true,
        message: 'No executives found for escalation'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Send notifications to all executives
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');
    
    if (!sendGridApiKey) {
      console.error('SendGrid API key not configured');
      throw new Error('Email service not configured');
    }

    const emailPromises = executives.map(async (executive: ExecutiveRecipient) => {
      const emailBody = buildEscalationEmailBody(feedback, executive, escalationType);
      
      const emailPayload = {
        personalizations: [
          {
            to: [{ email: executive.email, name: executive.display_name }],
            subject: getEmailSubject(feedback, escalationType, executive.role)
          }
        ],
        from: { email: "noreply@yourcompany.com", name: "Customer Feedback System" },
        content: [
          {
            type: "text/html",
            value: emailBody
          }
        ]
      };

      const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendGridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error(`Failed to send email to ${executive.email}:`, errorText);
        throw new Error(`Email delivery failed for ${executive.email}`);
      }

      console.log(`Critical escalation email sent to ${executive.role}: ${executive.email}`);
      return { recipient: executive.email, status: 'sent' };
    });

    const emailResults = await Promise.allSettled(emailPromises);
    const successCount = emailResults.filter(result => result.status === 'fulfilled').length;
    const failureCount = emailResults.filter(result => result.status === 'rejected').length;

    // Log the escalation in our system
    await supabase
      .from('escalation_log')
      .insert({
        feedback_id: feedbackId,
        escalated_from: 'system',
        escalated_to: 'executives',
        escalation_reason: `${escalationType} notification sent to ${successCount} executives`,
      });

    console.log(`Escalation complete: ${successCount} successful, ${failureCount} failed`);

    return new Response(JSON.stringify({
      success: true,
      message: `Critical escalation sent to ${successCount} executives`,
      recipients: emailResults.map((result, index) => ({
        email: executives[index].email,
        role: executives[index].role,
        status: result.status === 'fulfilled' ? 'sent' : 'failed'
      }))
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in critical escalation function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});

function getEmailSubject(feedback: any, escalationType: string, role: string): string {
  const urgencyPrefix = escalationType === 'sla_violation' ? '🚨 SLA VIOLATION' : '⚠️ CRITICAL ISSUE';
  const rolePrefix = role === 'ceo' ? 'CEO ALERT' : role === 'vp' ? 'VP ALERT' : 'EXECUTIVE ALERT';
  
  return `${urgencyPrefix} - ${rolePrefix}: Case ${feedback.case_number} - ${feedback.complaint_category}`;
}

function buildEscalationEmailBody(feedback: any, executive: ExecutiveRecipient, escalationType: string): string {
  const urgencyLevel = escalationType === 'sla_violation' ? 'IMMEDIATE ACTION REQUIRED' : 'CRITICAL ESCALATION';
  const roleSpecificMessage = getRoleSpecificMessage(executive.role, escalationType);
  const deadline = feedback.sla_deadline ? new Date(feedback.sla_deadline).toLocaleString() : 'Not set';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Critical Issue Escalation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="background-color: #dc2626; color: white; padding: 15px; margin: -30px -30px 20px -30px; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">${urgencyLevel}</h1>
                <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Executive Leadership Notification</p>
            </div>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin-bottom: 20px;">
                <p style="margin: 0; font-weight: bold; color: #991b1b;">
                    ${roleSpecificMessage}
                </p>
            </div>
            
            <h2 style="color: #333; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">Customer Feedback Details</h2>
            
            <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
                <tr style="background-color: #f9fafb;">
                    <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; width: 30%;">Case Number:</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; color: #dc2626; font-weight: bold;">${feedback.case_number}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Priority:</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; color: #dc2626; font-weight: bold;">${feedback.priority}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                    <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Category:</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb;">${feedback.complaint_category}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Location:</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb;">${feedback.market} - Store ${feedback.store_number}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                    <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Date Received:</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb;">${new Date(feedback.feedback_date).toLocaleDateString()}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">SLA Deadline:</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; color: #dc2626; font-weight: bold;">${deadline}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                    <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Customer:</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb;">${feedback.customer_name || 'Not provided'}</td>
                </tr>
            </table>
            
            <h3 style="color: #333; margin-top: 25px;">Customer Feedback:</h3>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #6b7280; margin-bottom: 20px;">
                <p style="margin: 0; font-style: italic;">${feedback.feedback_text || 'No detailed feedback provided'}</p>
            </div>
            
            <div style="background-color: #eff6ff; border: 1px solid #3b82f6; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #1e40af;">Immediate Actions Required:</h4>
                <ul style="margin: 0; padding-left: 20px; color: #374151;">
                    <li>Review and assess the situation immediately</li>
                    <li>Contact the store/market leadership</li>
                    <li>Ensure customer is contacted within SLA timeframe</li>
                    <li>Document executive oversight and decisions</li>
                    <li>Monitor resolution progress closely</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #6b7280; font-size: 12px;">
                    This is an automated escalation notification.<br>
                    Critical issues require immediate executive attention and oversight.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
}

function getRoleSpecificMessage(role: string, escalationType: string): string {
  const isViolation = escalationType === 'sla_violation';
  
  switch (role) {
    case 'ceo':
      return isViolation 
        ? 'CEO NOTIFICATION: A critical customer issue has exceeded SLA deadlines and requires your immediate oversight.'
        : 'CEO NOTIFICATION: A critical customer issue has been escalated to the executive level and requires your awareness.';
    case 'vp':
      return isViolation
        ? 'VP ESCALATION: A critical customer issue has violated SLA requirements and needs immediate intervention.'
        : 'VP ESCALATION: A critical customer issue requires your direct oversight and leadership.';
    case 'director':
      return isViolation
        ? 'DIRECTOR ALERT: Critical customer issue has exceeded response timeframes and requires your immediate action.'
        : 'DIRECTOR ALERT: Critical customer issue requires your direct attention and management.';
    default:
      return isViolation
        ? 'EXECUTIVE ALERT: Critical customer issue requires immediate escalation and action.'
        : 'EXECUTIVE ALERT: Critical customer issue requires executive oversight.';
  }
}
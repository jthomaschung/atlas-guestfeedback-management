import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OutreachRequest {
  feedbackId: string;
  method: 'email';
  messageContent?: string;
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
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { feedbackId, method, messageContent }: OutreachRequest = await req.json();

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
        outreach_method: method,
        message_content: messageContent || `Thank you for your feedback regarding your visit to our store #${feedback.store_number}. We take all customer feedback seriously and are working to address your concerns.`,
        delivery_status: 'pending'
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

    // Send email
    try {
      const emailSubject = `Thank you for your feedback - Case #${feedback.case_number}`;
      const emailBody = messageContent || `
        <h2>Thank you for your feedback</h2>
        <p>Dear ${feedback.customer_name || 'Valued Customer'},</p>
        <p>Thank you for taking the time to share your feedback regarding your recent visit to our store #${feedback.store_number}.</p>
        <p>We take all customer feedback seriously and are committed to providing excellent service. Your feedback helps us improve our operations and better serve our customers.</p>
        <p><strong>Case Number:</strong> ${feedback.case_number}</p>
        <p><strong>Feedback Date:</strong> ${new Date(feedback.feedback_date).toLocaleDateString()}</p>
        ${feedback.feedback_text ? `<p><strong>Your Feedback:</strong> ${feedback.feedback_text}</p>` : ''}
        <p>If you have any questions or would like to discuss this further, please don't hesitate to contact us.</p>
        <p>Thank you for choosing us!</p>
        <p>Best regards,<br>Customer Service Team</p>
      `;

      const emailResponse = await resend.emails.send({
        from: 'Guest Feedback <guestfeedback@atlaswe.com>',
        to: [feedback.customer_email],
        subject: emailSubject,
        html: emailBody,
      });

      console.log('Email sent successfully:', emailResponse);

      // Update outreach log with success
      await supabase
        .from('customer_outreach_log')
        .update({ delivery_status: 'delivered' })
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

serve(handler);
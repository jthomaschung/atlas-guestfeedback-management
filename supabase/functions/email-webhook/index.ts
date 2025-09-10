import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailWebhookEvent {
  type: string;
  created_at: string;
  data: {
    message_id: string;
    from: string;
    to: string[];
    subject: string;
    html?: string;
    text?: string;
    reply_to?: string;
    in_reply_to?: string;
    references?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    console.log('📧 EMAIL WEBHOOK: Received webhook request');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const webhookEvent: EmailWebhookEvent = await req.json();
    console.log('📧 EMAIL WEBHOOK: Event type:', webhookEvent.type);
    console.log('📧 EMAIL WEBHOOK: Event data:', webhookEvent.data);

    // Handle delivery status updates from Resend
    if (webhookEvent.type === 'email.delivered') {
      const { data: emailData } = webhookEvent;
      
      console.log('📧 EMAIL WEBHOOK: Processing delivery confirmation');
      
      // Find the outreach log entry by message ID
      const { error: updateError } = await supabase
        .from('customer_outreach_log')
        .update({
          delivery_status: 'delivered',
        })
        .eq('email_message_id', emailData.message_id);

      if (updateError) {
        console.error('📧 EMAIL WEBHOOK: Error updating delivery status:', updateError);
        return new Response('Error updating delivery status', { 
          status: 500, 
          headers: corsHeaders 
        });
      }

      console.log('📧 EMAIL WEBHOOK: Updated delivery status to delivered');
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Delivery status updated',
        status: 'delivered'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle bounced emails
    if (webhookEvent.type === 'email.bounced') {
      const { data: emailData } = webhookEvent;
      
      console.log('📧 EMAIL WEBHOOK: Processing email bounce');
      
      // Find the outreach log entry by message ID
      const { error: updateError } = await supabase
        .from('customer_outreach_log')
        .update({
          delivery_status: 'bounced',
        })
        .eq('email_message_id', emailData.message_id);

      if (updateError) {
        console.error('📧 EMAIL WEBHOOK: Error updating bounce status:', updateError);
        return new Response('Error updating bounce status', { 
          status: 500, 
          headers: corsHeaders 
        });
      }

      console.log('📧 EMAIL WEBHOOK: Updated delivery status to bounced');
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Bounce status updated',
        status: 'bounced'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle email complaints
    if (webhookEvent.type === 'email.complained') {
      const { data: emailData } = webhookEvent;
      
      console.log('📧 EMAIL WEBHOOK: Processing email complaint');
      
      // Find the outreach log entry by message ID
      const { error: updateError } = await supabase
        .from('customer_outreach_log')
        .update({
          delivery_status: 'complained',
        })
        .eq('email_message_id', emailData.message_id);

      if (updateError) {
        console.error('📧 EMAIL WEBHOOK: Error updating complaint status:', updateError);
        return new Response('Error updating complaint status', { 
          status: 500, 
          headers: corsHeaders 
        });
      }

      console.log('📧 EMAIL WEBHOOK: Updated delivery status to complained');
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Complaint status updated',
        status: 'complained'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle incoming email replies
    if (webhookEvent.type === 'email.received') {
      const { data: emailData } = webhookEvent;
      
      console.log('📧 EMAIL WEBHOOK: Processing incoming email reply');
      console.log('📧 EMAIL WEBHOOK: Incoming email data:', emailData);
      
      // Extract the original message ID from references or in_reply_to
      const originalMessageId = emailData.in_reply_to || 
        (emailData.references && emailData.references.split(' ')[0]);
      
      if (!originalMessageId) {
        console.log('📧 EMAIL WEBHOOK: No reference to original message found');
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'No original message reference found'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Find the original outreach log entry
      const { data: originalOutreach, error: findError } = await supabase
        .from('customer_outreach_log')
        .select('feedback_id')
        .eq('email_message_id', originalMessageId)
        .single();

      if (findError || !originalOutreach) {
        console.error('📧 EMAIL WEBHOOK: Error finding original outreach:', findError);
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Original outreach not found'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Insert the customer reply into outreach log
      const { error: insertError } = await supabase
        .from('customer_outreach_log')
        .insert({
          feedback_id: originalOutreach.feedback_id,
          direction: 'inbound',
          outreach_method: 'email',
          from_email: emailData.from,
          to_email: emailData.to[0],
          subject: emailData.subject,
          message_content: emailData.text || emailData.html,
          email_message_id: emailData.message_id,
          delivery_status: 'delivered',
          response_received: true
        });

      if (insertError) {
        console.error('📧 EMAIL WEBHOOK: Error inserting customer reply:', insertError);
        return new Response('Error storing customer reply', { 
          status: 500, 
          headers: corsHeaders 
        });
      }

      // Update the feedback record with customer response info
      const { error: updateFeedbackError } = await supabase
        .from('customer_feedback')
        .update({
          customer_responded_at: new Date().toISOString(),
          customer_response_sentiment: 'neutral' // Default to neutral, can be analyzed later
        })
        .eq('id', originalOutreach.feedback_id);

      if (updateFeedbackError) {
        console.error('📧 EMAIL WEBHOOK: Error updating feedback record:', updateFeedbackError);
      }

      console.log('📧 EMAIL WEBHOOK: Customer reply stored successfully');
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Customer reply stored',
        feedback_id: originalOutreach.feedback_id
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('📧 EMAIL WEBHOOK: Unhandled event type:', webhookEvent.type);
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Event received but not processed',
      event_type: webhookEvent.type
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('📧 EMAIL WEBHOOK: Error processing webhook:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);
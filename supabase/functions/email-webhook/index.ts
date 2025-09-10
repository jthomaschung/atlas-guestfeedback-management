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

    // Handle incoming email events (customer replies)
    if (webhookEvent.type === 'email.received') {
      const { data: emailData } = webhookEvent;
      
      console.log('📧 EMAIL WEBHOOK: Processing incoming email from:', emailData.from);
      
      // Try to find the related feedback by matching customer email
      // We'll look for recent outreach to this customer
      const { data: recentOutreach, error: outreachError } = await supabase
        .from('customer_outreach_log')
        .select(`
          *,
          customer_feedback!inner(
            id,
            customer_email,
            customer_name,
            case_number
          )
        `)
        .eq('customer_feedback.customer_email', emailData.from)
        .eq('direction', 'outbound')
        .order('sent_at', { ascending: false })
        .limit(1);

      if (outreachError) {
        console.error('📧 EMAIL WEBHOOK: Error finding recent outreach:', outreachError);
        return new Response('Error finding related feedback', { 
          status: 500, 
          headers: corsHeaders 
        });
      }

      if (!recentOutreach || recentOutreach.length === 0) {
        console.log('📧 EMAIL WEBHOOK: No recent outreach found for', emailData.from);
        return new Response('No related feedback found', { 
          status: 404, 
          headers: corsHeaders 
        });
      }

      const relatedFeedback = recentOutreach[0];
      console.log('📧 EMAIL WEBHOOK: Found related feedback:', relatedFeedback.feedback_id);

      // Insert the incoming email as a conversation entry
      const { error: insertError } = await supabase
        .from('customer_outreach_log')
        .insert({
          feedback_id: relatedFeedback.feedback_id,
          direction: 'inbound',
          outreach_method: 'email',
          message_content: emailData.text || emailData.html || '',
          from_email: emailData.from,
          to_email: emailData.to[0] || '',
          subject: emailData.subject || '',
          email_message_id: emailData.message_id,
          email_thread_id: relatedFeedback.email_thread_id || emailData.in_reply_to || emailData.references,
          delivery_status: 'received',
          sent_at: webhookEvent.created_at,
        });

      if (insertError) {
        console.error('📧 EMAIL WEBHOOK: Error inserting incoming email:', insertError);
        return new Response('Error saving incoming email', { 
          status: 500, 
          headers: corsHeaders 
        });
      }

      // Update the feedback record to indicate customer responded
      const { error: updateError } = await supabase
        .from('customer_feedback')
        .update({
          customer_responded_at: webhookEvent.created_at,
          customer_response_sentiment: 'neutral', // Could be analyzed later
          updated_at: new Date().toISOString(),
        })
        .eq('id', relatedFeedback.feedback_id);

      if (updateError) {
        console.error('📧 EMAIL WEBHOOK: Error updating feedback:', updateError);
        // Don't fail the webhook for this
      }

      console.log('📧 EMAIL WEBHOOK: Successfully processed incoming email');
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Email processed successfully',
        feedback_id: relatedFeedback.feedback_id
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle delivery status updates
    if (webhookEvent.type === 'email.delivered' || webhookEvent.type === 'email.bounced') {
      const { data: emailData } = webhookEvent;
      const deliveryStatus = webhookEvent.type === 'email.delivered' ? 'delivered' : 'bounced';
      
      console.log('📧 EMAIL WEBHOOK: Processing delivery status:', deliveryStatus);
      
      // Find the outreach log entry by message ID
      const { error: updateError } = await supabase
        .from('customer_outreach_log')
        .update({
          delivery_status: deliveryStatus,
        })
        .eq('email_message_id', emailData.message_id);

      if (updateError) {
        console.error('📧 EMAIL WEBHOOK: Error updating delivery status:', updateError);
        return new Response('Error updating delivery status', { 
          status: 500, 
          headers: corsHeaders 
        });
      }

      console.log('📧 EMAIL WEBHOOK: Updated delivery status to:', deliveryStatus);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Delivery status updated',
        status: deliveryStatus
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